import Link from 'next/link';

interface ResourceItemProps {
  title: string;
  meta: string;
  badgeType: 'PDF' | 'DOCX' | 'CALENDAR';
  href?: string;
}

export default function ResourceItem({ title, meta, badgeType, href = '#' }: ResourceItemProps) {
  return (
    <Link href={href} style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'var(--color-surface)',
      padding: '14px 20px',
      marginBottom: '8px',
      clipPath: 'polygon(20px 0, 100% 0, 100% 100%, 0 100%)',
      position: 'relative'
    }}>
      {/* Visual Kanan karena RTL = Badge */}
      <div style={{
        width: '44px',
        height: '44px',
        backgroundColor: badgeType === 'CALENDAR' ? 'transparent' : 'var(--color-primary-500)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {badgeType !== 'CALENDAR' ? (
          <span className="font-latin" style={{
            color: 'var(--color-white-text)',
            fontSize: '11px',
            fontWeight: 700
          }}>
            {badgeType}
          </span>
        ) : (
          <div style={{
            position: 'absolute',
            right: 0, // In RTL, right is visual right
            top: 0,
            bottom: 0,
            width: '8px',
            backgroundColor: 'var(--color-primary-500)'
          }} />
        )}
      </div>

      {/* Visual Kiri = Teks */}
      <div style={{ flexGrow: 1, marginInlineStart: '16px', textAlign: 'right' }}>
        <h3 className="text-h3" style={{ color: 'var(--color-ink)' }}>{title}</h3>
        <p className="text-meta font-latin" style={{ color: 'var(--color-stone)' }} dir="auto">{meta}</p>
      </div>
    </Link>
  );
}
