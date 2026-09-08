import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  href: string;
}

export default function ServiceCard({ title, href }: ServiceCardProps) {
  return (
    <Link href={href} style={{
      display: 'block',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface)',
      border: '0.5px solid rgba(52,48,45,0.1)'
    }}>
      <div style={{
        height: '90px',
        background: 'linear-gradient(to bottom, rgba(15, 69, 155, 0.6), rgba(19, 89, 200, 0.85) 90%), linear-gradient(135deg, #4a90d9 0%, #1359c8 50%, #0f459b 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div style={{ padding: '14px' }}>
        <h3 className="text-h3" style={{ color: 'var(--color-ink)', textAlign: 'right' }}>
          {title}
        </h3>
        <p className="text-meta" style={{ 
          color: 'var(--color-stone)', 
          marginTop: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>انظر التفاصيل</span>
          <span>&larr;</span>
        </p>
      </div>
    </Link>
  );
}
