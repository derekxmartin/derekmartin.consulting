import { ImageResponse } from 'next/og';
export const alt = 'Derek Martin. Tracking, handled. Ad ops and tracking implementation.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ background: '#FBFCFA', width: '100%', height: '100%', padding: 64, display: 'flex', flexDirection: 'column', color: '#073D33' }}><div style={{ fontSize: 28, display: 'flex', fontWeight: 700 }}>derek martin</div><div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}><div style={{ display: 'flex', flexDirection: 'column', fontSize: 100, lineHeight: 1, fontWeight: 700, letterSpacing: -5 }}><span>Tracking,</span><span>handled.</span></div><div style={{ display: 'flex', width: 300, height: 240, padding: 36, background: '#EDF6F0', borderRadius: 24, flexDirection: 'column', justifyContent: 'center', gap: 18, fontSize: 24 }}><div style={{ display: 'flex' }}>Ad tags & pixels</div><div style={{ display: 'flex' }}>Floodlight</div><div style={{ display: 'flex' }}>GA4 & GTM</div></div></div><div style={{ fontSize: 22, display: 'flex', color: '#596B64' }}>Ad ops & tracking implementation for agencies and independent marketers.</div></div>, size);
}
