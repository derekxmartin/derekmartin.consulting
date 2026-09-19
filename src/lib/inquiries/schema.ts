import { z } from 'zod';
import { serviceIds, defaultService } from '@/content/services';

const optionalText = (max: number) => z.string().trim().max(max, `Please use ${max} characters or fewer.`).default('');
const website = optionalText(2048).transform((input, context) => {
  if (!input) return '';
  try {
    const value = /^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`;
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error();
    if (url.href.length > 2048) throw new Error();
    return url.href.toLowerCase();
  } catch { context.addIssue({ code: 'custom', message: 'Enter a valid website using http or https.' }); return z.NEVER; }
});
export const timingOptions = ['Flexible', 'Within a month', 'Within two weeks', 'Urgent', 'Specific date'] as const;
export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100, 'Please use 100 characters or fewer.'),
  email: z.string().trim().max(254).email('Please enter a valid email address.').refine(v => !/[\r\n]/.test(v), 'Please enter a valid email address.'),
  company: optionalText(150), website,
  service: z.string().refine(v => [...serviceIds, defaultService].includes(v), 'Please choose a service.'),
  platforms: optionalText(300),
  description: z.string().trim().min(20, 'Please add a little more detail (at least 20 characters).').max(5000, 'Please use 5,000 characters or fewer.'),
  timing: z.enum(['', ...timingOptions]).default(''),
  desiredDate: optionalText(10), budget: optionalText(150),
}).superRefine((data, context) => {
  if (data.timing === 'Specific date') {
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(data.desiredDate) && !Number.isNaN(Date.parse(data.desiredDate)) && new Date(data.desiredDate).toISOString().startsWith(data.desiredDate);
    if (!valid) context.addIssue({ code: 'custom', path: ['desiredDate'], message: 'Please choose a valid desired date.' });
  }
}).transform(data => ({ ...data, desiredDate: data.timing === 'Specific date' ? data.desiredDate : '' }));
export type Inquiry = z.infer<typeof inquirySchema>;
export const submissionSchema = z.object({
  submissionId: z.string().uuid(),
  // Stable across retries so the provider receives an identical request body.
  submittedAt: z.string().datetime().refine(v => Date.now() - Date.parse(v) < 23 * 60 * 60 * 1000 && Date.parse(v) < Date.now() + 300000, 'Please reload the form to start a new request.'),
  honeypot: z.string().max(0), inquiry: inquirySchema,
}).strict();
export type Submission = z.infer<typeof submissionSchema>;
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) { const key = issue.path.at(-1); if (key !== undefined && !errors[String(key)]) errors[String(key)] = issue.message; }
  return errors;
}
