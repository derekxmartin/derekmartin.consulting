export function Arrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  return <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" style={direction === 'down' ? { transform: 'rotate(90deg)' } : undefined}><path d="M3 10h13M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
