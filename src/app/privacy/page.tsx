import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Privacy Notice', 'How Derek Martin collects, uses and retains website and project inquiry information.', '/privacy', !site.privacyContentApproved);

export default function Privacy() {
  return <div className="container page-body">
    <div className="page-intro"><span className="eyebrow">Last updated September 18, 2026</span><h1>Privacy notice</h1></div>
    <article className="reading">
      <h2>Who operates this website</h2>
      <p>I’m Derek Martin, an independent ad ops and tracking implementation consultant based in Berkeley, California, USA. My services are directed toward business clients in the United States. This notice explains how I handle information collected through derekmartin.consulting and related project correspondence.</p>
      <p>For privacy questions or requests, email <a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a>.</p>

      <h2>Information I collect and why</h2>
      <p>The project inquiry form collects your name, email address, selected service and project description. You may also provide your company, client website, platforms, target timing, desired date and budget note. If you contact me directly, I receive the information you include in your correspondence.</p>
      <p>I use this information to respond, discuss scope, prepare proposals, deliver agreed services and maintain project records. I do not use inquiries for newsletters or marketing emails. Please do not include passwords, access tokens, sensitive personal information or your customers’ data in the form. Any access needed for a project is arranged separately.</p>
      <p>Hosting and form providers also process technical information, such as IP addresses, browser details, request times and referring pages, to deliver their services, prevent spam and protect the website.</p>

      <h2>Where information is handled</h2>
      <ul>
        <li><strong>Formspree</strong> processes and stores form submissions, filters spam and sends inquiry notifications. See <a href="https://formspree.io/legal/privacy-policy/">Formspree’s privacy policy</a>.</li>
        <li><strong>Gmail, provided by Google,</strong> receives inquiry notifications and holds my email correspondence. See <a href="https://policies.google.com/privacy">Google’s privacy policy</a>.</li>
        <li><strong>Vercel</strong> hosts this website and processes technical request and diagnostic information to operate and secure it. See <a href="https://vercel.com/legal/privacy-notice">Vercel’s privacy notice</a>.</li>
        <li><strong>Google Analytics and Google Tag Manager</strong> provide optional website measurement, as described below. See <a href="https://policies.google.com/technologies/partner-sites">how Google uses information from sites that use its services</a>.</li>
      </ul>
      <p>I currently keep inquiry submissions and correspondence in Formspree and Gmail, without copying them to a separate CRM or spreadsheet. Providers may process information in the United States and other countries where they operate. Their own policies describe their processing practices. Information may also be disclosed when required by law or necessary to address fraud, security incidents or legal claims.</p>

      <h2>Optional analytics and browser storage</h2>
      <p>Google Analytics stays off until you select Accept analytics. If you accept, Google Tag Manager loads Google Analytics to measure page visits, service-link clicks, form starts, form errors, confirmed inquiries and email, phone and LinkedIn link clicks. Google receives information about your browser and device, the pages you visit and your interactions, and uses analytics cookies to distinguish visits.</p>
      <p>I do not send inquiry names, email addresses, phone numbers or message contents as analytics event parameters. The site’s analytics configuration leaves advertising storage, advertising user data and ad personalization disabled.</p>
      <p>You can decline analytics and still use the website and contact form. Use Cookie settings in the footer to change your choice at any time. Withdrawing consent stops future analytics collection and clears the site’s Google Analytics cookies; it does not automatically delete information already received by Google. Your preference is saved in your browser’s local storage. The site does not save form contents in local storage.</p>
      <p>This website does not currently change its behavior in response to a browser’s Do Not Track signal. Use the site’s Cookie settings to control optional analytics. External sites, including LinkedIn, apply their own privacy practices when you follow their links.</p>

      <h2>How long I keep records</h2>
      <ul>
        <li><strong>Inquiries that do not become client engagements:</strong> 12 months after our last contact.</li>
        <li><strong>Client correspondence and project records:</strong> two years after the project is completed.</li>
      </ul>
      <p>I manage deletion manually in Formspree and Gmail; the website does not automatically delete these records. Records required by law or needed for an ongoing dispute may be retained longer for that purpose. These periods apply to records I control, rather than prescribing the retention of provider security logs, backups or analytics data.</p>

      <h2>Access, corrections and deletion</h2>
      <p>You can email <a href={`mailto:${site.publicEmail}`}>{site.publicEmail}</a> to ask about information I hold about you, request a copy or correction, or request deletion. I may need to verify that the request relates to your information. I will explain if a legal requirement or an ongoing dispute prevents me from deleting a particular record.</p>

      <h2>Changes to this notice</h2>
      <p>I will update this page if my practices change and revise the date above. Please check it for the current description of how your information is handled.</p>
    </article>
  </div>;
}
