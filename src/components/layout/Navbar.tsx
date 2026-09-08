import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={{
      height: '90px',
      backgroundColor: 'var(--color-surface)',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-sticky)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src="/images/navbar_logo.png"
          alt="حاشية (Haashiya)"
          width={120}
          height={48}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="text-button" style={{
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-white-text)',
          borderRadius: '20px',
          padding: '8px 18px',
          fontFamily: 'var(--font-arabic)'
        }}>
          تسجيل الدخول
        </button>
        {/* Menu icon button */}
        <button aria-label="القائمة" style={{
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1.5px solid var(--color-ink)',
          backgroundColor: 'transparent',
          color: 'var(--color-ink)',
          fontSize: '18px',
          lineHeight: 1
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
