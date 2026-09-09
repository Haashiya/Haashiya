import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  href: string;
}

export default function ServiceCard({ title, href }: ServiceCardProps) {
  return (
    <Link href={href} style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 4px 8px -4px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        height: '45px',
        flexShrink: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80")',
        backgroundColor: '#e2e8f0',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        padding: '10px 12px 4px',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        backgroundColor: 'var(--color-surface)',
        marginTop: '-5px',
        position: 'relative'
      }}>
        <h3 className="text-h3" style={{
          color: 'var(--color-ink)',
          textAlign: 'right',
          fontSize: '17px',
          fontWeight: '700',
          lineHeight: '1.2',
          minHeight: '41px'
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
          fontSize: '13px',
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
