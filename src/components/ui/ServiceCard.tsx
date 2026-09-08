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
        backgroundColor: '#e2e8f0', 
        backgroundImage: 'linear-gradient(to bottom, transparent, rgba(19, 89, 200, 0.7) 90%), url(https://images.unsplash.com/photo-1555661530-68c8e98db4e6?auto=format&fit=crop&q=80&w=400)',
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
