import Link from 'next/link';

interface ResourceItemProps {
  title: string;
  meta: string;
  badgeType: 'PDF' | 'DOCX' | 'CALENDAR';
  href?: string;
}

export default function ResourceItem({ title, meta, badgeType, href = '#' }: ResourceItemProps) {
  const isCalendar = badgeType === 'CALENDAR';

  return (
    <Link href={href} style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'var(--color-surface)',
      padding: '14px 20px',
      clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)',
      position: 'relative',
      ...(isCalendar ? { borderInlineEnd: '7px solid var(--color-primary-500)' } : {})
    }}>
      {/* Badge — only for PDF/DOCX types */}
      {!isCalendar && (
        <div style={{
          width: '44px',
          height: '44px',
          backgroundColor: 'var(--color-primary-500)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span className="font-latin" style={{
            color: 'var(--color-white-text)',
            fontSize: '11px',
            fontWeight: 700
          }}>
            {badgeType}
          </span>
        </div>
      )}

      {/* Text content */}
      <div style={{ flexGrow: 1, marginInlineStart: isCalendar ? '0' : '16px', textAlign: 'right' }}>
        <h3 className="text-h3" style={{ color: 'var(--color-ink)' }}>{title}</h3>
        <p className="text-meta" style={{ color: 'var(--color-stone)' }} dir="auto">{meta}</p>
      </div>
    </Link>
  );
}
