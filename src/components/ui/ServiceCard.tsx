"use client";
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  href: string;
  image?: string;
}

export default function ServiceCard({ title, href, image = '/images/footer_bg.png' }: ServiceCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (href === '#coming-soon') {
      e.preventDefault();
      if (typeof window !== 'undefined' && (window as any).showGlobalToast) {
        (window as any).showGlobalToast('قريباً! هذه الصفحة قيد التطوير.');
      }
    }
  };

  return (
    <Link href={href} onClick={handleClick} style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface)',
      boxShadow: '0 4px 8px -4px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        height: 'clamp(35px, 10vw, 45px)', // Tinggi gambar proporsional
        flexShrink: 0,
        backgroundImage: `url("${image}")`,
        backgroundColor: '#e2e8f0',
        backgroundSize: 'cover',
        backgroundPosition: '50% 3%',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: '9px 12px 3px',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        backgroundColor: 'var(--color-surface)',
        marginTop: '-5px',
        position: 'relative'
      }}>
        <h3 className="text-h3" style={{
          color: 'var(--color-ink)',
          textAlign: 'right',
          fontSize: 'clamp(14px, 4vw, 17px)', // Font proporsional
          fontWeight: '700',
          lineHeight: '1.2',
          minHeight: 'clamp(34px, 9vw, 41px)' // Tinggi minimum proporsional
        }}>
          {title}
        </h3>
        <p className="text-meta" style={{
          color: '#999',
          marginTop: 'auto',
          paddingTop: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '6px',
          fontSize: 'clamp(11px, 3vw, 13px)', // Font proporsional
          direction: 'ltr'
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
            <path d="M19 12H5"></path>
            <path d="M11 19l-7-7 7-7"></path>
          </svg>
          <span>انظر التفاصيل</span>
        </p>
      </div>
    </Link>
  );
}
