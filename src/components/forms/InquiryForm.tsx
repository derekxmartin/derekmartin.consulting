'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubmit } from '@formspree/react';
import { useRef, useState, type ReactNode, type FormEvent } from 'react';
import { services, serviceTitle } from '@/content/services';
import { inquirySchema, fieldErrors, timingOptions, type Submission } from '@/lib/inquiries/schema';
import { track } from '@/lib/analytics/events';
import { Arrow } from '../Arrow';
import styles from './form.module.css';

function Field({ id, label, optional, hint, error, children }: { id: string; label: string; optional?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return <div className={styles.field}><label htmlFor={id}>{label} <span>{optional ? '(optional)' : '(required)'}</span></label>{children}{hint && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}{error && <p className={styles.fieldError} id={`${id}-error`}>{error}</p>}</div>;
}
type State = 'idle' | 'submitting' | 'uncertain' | 'error' | 'success';
export function InquiryForm({ service, mock, publicEmail, formspreeId = '' }: { service: string; mock: boolean; publicEmail: string; formspreeId?: string }) {
  const router = useRouter();
  const submitToFormspree = useSubmit(formspreeId);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const submitting = useRef(false);
  const attempt = useRef<{ value: string; payload: Submission } | null>(null);
  const [timing, setTiming] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<State>('idle');
  const [message, setMessage] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const describedBy = (id: string, hint = false) => [hint ? `${id}-hint` : '', errors[id] ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const props = (id: string, hint = false) => ({ id, name: id, 'aria-invalid': !!errors[id], 'aria-describedby': describedBy(id, hint) });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (Date.now() < retryAt) { setMessage('Please wait before retrying. Your request is still here.'); return; }
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const validation = inquirySchema.safeParse(status === 'uncertain' ? attempt.current?.payload.inquiry : raw);
    if (!validation.success) {
      setErrors(fieldErrors(validation.error)); setMessage('Please check the highlighted fields.'); setStatus('error');
      if (!mock) track('form_error', { form_id: 'project-inquiry', error_category: 'validation' });
      requestAnimationFrame(() => summaryRef.current?.focus()); return;
    }
    setErrors({});
    const value = JSON.stringify(validation.data);
    if (!attempt.current || attempt.current.value !== value) attempt.current = { value, payload: { submissionId: crypto.randomUUID(), submittedAt: new Date().toISOString(), honeypot: String(raw.extraField || ''), inquiry: validation.data } };
    submitting.current = true; setStatus('submitting'); setMessage('Sending your project request…');
    try {
      if (formspreeId) {
        const payload = attempt.current.payload;
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const result = await Promise.race([submitToFormspree({
          ...payload.inquiry, service: serviceTitle(payload.inquiry.service),
          message: payload.inquiry.description, _gotcha: payload.honeypot,
          subject: 'Project request from derekmartin.consulting',
          submissionId: payload.submissionId, submittedAt: payload.submittedAt,
        }), new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('Delivery confirmation timed out')), 20000); })]).finally(() => clearTimeout(timeout));
        if (result.kind === 'success') {
          track('generate_lead', { form_id: 'project-inquiry', service_id: validation.data.service });
          setStatus('success'); return;
        }
        const providerErrors: Record<string, string> = {};
        for (const [field, items] of result.getAllFieldErrors()) {
          const key = field === 'message' ? 'description' : String(field);
          if (key in validation.data) providerErrors[key] = items.map(item => item.message).join('. ');
        }
        setErrors(providerErrors);
        const unknown = result.getFormErrors().some(item => item.code === 'UNSPECIFIED');
        setMessage(unknown ? 'I couldn’t confirm that your request was sent. Your details are still here.' : result.getFormErrors().map(item => item.message).join('. ') || 'Please check your details and try again.');
        setStatus(unknown ? 'uncertain' : 'error');
        track('form_error', { form_id: 'project-inquiry', error_category: unknown ? 'uncertain' : 'unavailable' });
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(attempt.current.payload), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (response.ok && result.ok === true) {
        if (!result.mock && !result.duplicate) track('generate_lead', { form_id: 'project-inquiry', service_id: validation.data.service });
        setMessage(result.mock ? 'Test request accepted. Opening the test confirmation…' : 'Your request was accepted. Opening confirmation…');
        router.push('/contact/thanks'); return;
      }
      setErrors(result.errors || {});
      setMessage(result.message || 'The project form is temporarily unavailable. Please try again.');
      setStatus(result.category === 'uncertain' ? 'uncertain' : 'error');
      if (response.status === 429) setRetryAt(Date.now() + Number(response.headers.get('Retry-After') || 60) * 1000);
      if (!mock) track('form_error', { form_id: 'project-inquiry', error_category: result.category });
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setStatus('uncertain'); setMessage('I couldn’t confirm that your request was sent. Please retry or use email.');
      if (!mock) track('form_error', { form_id: 'project-inquiry', error_category: 'uncertain' });
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally { submitting.current = false; }
  }
  if (status === 'success') return <div data-inquiry-status="success" className={styles.form} role="status" tabIndex={-1} ref={element => element?.focus()}>
    <span className="eyebrow">Project request received</span><h2>Thanks for the details.</h2>
    <p>Your project request has been received. I typically get back in 1-2 business days.</p>
    <div className="actions"><Link className="button" href="/how-it-works">What happens next <Arrow /></Link></div>
  </div>;
  return <form ref={formRef} className={styles.form} onSubmit={submit} noValidate onChange={() => {
    if (!started.current) { started.current = true; if (!mock) track('form_start', { form_id: 'project-inquiry' }); }
  }}>
    {mock && <div className={`notice ${styles.mockNotice}`}>Local test mode. This form simulates delivery; no email is sent.</div>}
    <div className={styles.srOnly} role="status" aria-live="polite">{status === 'submitting' ? message : ''}</div>
    {message && status !== 'submitting' && <div className={styles.errorSummary} ref={summaryRef} tabIndex={-1} role="alert"><p>{message}</p>{Object.keys(errors).length > 0 && <ul>{Object.entries(errors).map(([key, error]) => <li key={key}><a href={`#${key}`} onClick={event => { event.preventDefault(); document.getElementById(key)?.focus(); }}>{error}</a></li>)}</ul>}{status === 'uncertain' && <p>{formspreeId ? 'Your request may already have arrived. Retrying could send a second copy.' : 'Retrying uses the same request reference and details to prevent a duplicate notification.'}</p>}{publicEmail && <p>You can also <a href={`mailto:${publicEmail}`}>email {publicEmail}</a>.</p>}</div>}
    <fieldset disabled={status === 'submitting' || status === 'uncertain'} className={styles.fields}>
      <legend className={styles.srOnly}>Project request details</legend>
      <div className={styles.row}>
        <Field id="name" label="Name" error={errors.name}><input {...props('name')} required maxLength={100} autoComplete="name" /></Field>
        <Field id="email" label="Email" error={errors.email}><input {...props('email')} type="email" required maxLength={254} autoComplete="email" /></Field>
      </div>
      <div className={styles.row}>
        <Field id="company" label="Agency / company" optional error={errors.company}><input {...props('company')} maxLength={150} autoComplete="organization" /></Field>
        <Field id="website" label="Client website" optional error={errors.website}><input {...props('website')} type="text" inputMode="url" maxLength={2048} placeholder="example.com" autoComplete="url" autoCapitalize="none" spellCheck={false} onChange={event => {
          const input = event.currentTarget;
          const start = input.selectionStart;
          const end = input.selectionEnd;
          input.value = input.value.toLowerCase();
          input.setSelectionRange(start, end);
        }} /></Field>
      </div>
      <Field id="service" label="Main service" error={errors.service}><select {...props('service')} required defaultValue={service}><option value="not-sure">Not sure / help scoping</option>{services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></Field>
      <Field id="platforms" label="Platforms involved" optional hint="For example: CM360, Google Ads, GTM." error={errors.platforms}><input {...props('platforms', true)} maxLength={300} /></Field>
      <Field id="description" label="Project description" hint="Please leave out passwords, access tokens and customer data. We can arrange access once the scope is agreed." error={errors.description}><textarea {...props('description', true)} required minLength={20} maxLength={5000} rows={6} placeholder="What needs implementing, or what isn’t working as expected?" /></Field>
      <Field id="timing" label="Target timing" optional error={errors.timing}><select {...props('timing')} value={timing} onChange={event => setTiming(event.target.value)}><option value="">Select timing</option>{timingOptions.map(value => <option key={value} value={value}>{value}</option>)}</select></Field>
      {timing === 'Specific date' && <Field id="desiredDate" label="Desired date" error={errors.desiredDate} hint="Your target date helps with scoping; it is not a delivery commitment."><input {...props('desiredDate', true)} type="date" required /></Field>}
      <Field id="budget" label="Budget note" optional error={errors.budget}><input {...props('budget')} maxLength={150} placeholder="An available budget or helpful context" /></Field>
      <div className={styles.honeypot} aria-hidden="true"><label htmlFor="extraField">Leave this field empty</label><input id="extraField" name="extraField" tabIndex={-1} autoComplete="off" /></div>
    </fieldset>
    <p className={styles.privacy}>I’ll use these details to review your request and follow up about the project. See the <Link href="/privacy">privacy notice</Link>.</p>
    <button className={`button ${styles.submit}`} type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Sending…' : status === 'uncertain' ? 'Retry project request' : 'Send project request'}<Arrow /></button>
    <p className={styles.hint}>Submitting starts a scoping conversation. It doesn’t book work or incur a charge.</p>
  </form>;
}
