import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={{
      height: '72px',
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
          width={70}
          height={8}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{
          backgroundColor: 'rgba(56, 58, 58, 1)',
          color: 'var(--color-white-text)',
          borderRadius: '5px',
          padding: '6px 16px 10px 16px',
          fontFamily: 'var(--font-base)',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: 1
        }}>
          تسجيل الدخول
        </button>
        {/* Menu icon button */}
        <button aria-label="القائمة" style={{
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          border: '1.5px solid var(--color-primary-600)',
          backgroundColor: 'transparent',
          color: 'var(--color-primary-600)',
          padding: 0
        }}>
          <svg width="22" height="22" viewBox="0 0 16 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            {/* Titik Atas */}
            <path d="M8 1L11.5 4.5L8 8L4.5 4.5Z" />
            {/* Titik Tengah (digeser ke bawah 1px) */}
            <path d="M8 4.5L11.5 8L8 11.5L4.5 8Z" transform="translate(0, 2)" />
            {/* Titik Bawah (digeser ke bawah 2px) */}
            <path d="M8 8L11.5 11.5L8 15L4.5 11.5Z" transform="translate(0, 4)" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
