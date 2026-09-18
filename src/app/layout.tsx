import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { origin, pageTitle, titleBrand } from '@/lib/metadata';
import '@/styles/globals.css';

const manrope = localFont({ src: '../../fonts/manrope-latin.woff2', weight: '200 800', display: 'swap', variable: '--font-manrope' });
export const metadata: Metadata = {
  metadataBase: new URL(origin()), title: { default: pageTitle('Home'), template: `%s | ${titleBrand}` },
  description: 'Ad tags, Floodlight and analytics implementation for agencies and independent marketers. Scoped, tested and ready to hand off.',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: '16x16 32x32 48x48' },
      { url: '/favicon-32.png?v=2', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={manrope.variable}><body>
    <div className="ambient-background" aria-hidden="true">
      <svg className="ambient-routes ambient-routes-right" viewBox="0 0 360 680" fill="none" focusable="false">
        <path className="ambient-track" d="M360 36H248Q216 36 216 68V160Q216 192 184 192H116Q84 192 84 224V344Q84 376 116 376H224Q256 376 256 408V512Q256 544 288 544H360" />
        <path className="ambient-track" d="M360 288H304Q272 288 272 320V432Q272 464 240 464H184Q152 464 152 496V612Q152 644 120 644H40" />
        <path className="ambient-signal" pathLength="100" d="M360 36H248Q216 36 216 68V160Q216 192 184 192H116Q84 192 84 224V344Q84 376 116 376H224Q256 376 256 408V512Q256 544 288 544H360" />
        <path className="ambient-signal ambient-signal-secondary" pathLength="100" d="M360 288H304Q272 288 272 320V432Q272 464 240 464H184Q152 464 152 496V612Q152 644 120 644H40" />
      </svg>
      <svg className="ambient-routes ambient-routes-left" viewBox="0 0 200 440" fill="none" focusable="false">
        <path className="ambient-track" d="M0 40H72Q104 40 104 72V180Q104 212 136 212H152Q184 212 184 244V336Q184 368 152 368H0" />
        <path className="ambient-signal" pathLength="100" d="M0 40H72Q104 40 104 72V180Q104 212 136 212H152Q184 212 184 244V336Q184 368 152 368H0" />
      </svg>
    </div>
    <a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" tabIndex={-1}>{children}</main><Footer />
  </body></html>;
}
