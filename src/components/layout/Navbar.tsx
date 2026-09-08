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
      <div>
        <button className="text-button" style={{
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-white-text)',
          borderRadius: '15px',
          padding: '8px 18px',
          fontFamily: 'var(--font-arabic)'
        }}>
          تسجيل الدخول
        </button>
      </div>
    </nav>
  );
}
