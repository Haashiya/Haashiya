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
    <div style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))' }}>
      <Link href={href} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--color-surface)',
        padding: '10px 16px',
        clipPath: 'polygon(35px 0, 100% 0, 100% 100%, 0 100%)',
        position: 'relative',
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px',
      }}>
        {/* Badge — only for PDF/DOCX types */}
        {!isCalendar && (
          <div style={{
            width: 'clamp(36px, 10vw, 42px)',
            height: 'clamp(36px, 10vw, 42px)',
            background: 'linear-gradient(to right, var(--color-primary-500), var(--color-primary-600))',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="font-latin" style={{
              color: 'var(--color-white-text)',
              fontSize: 'clamp(13px, 3.5vw, 15px)',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
              textAlign: 'center',
              lineHeight: 1
            }}>
              {badgeType === 'DOCX' ? (
                <>DO<br />CX</>
              ) : (
                badgeType
              )}
            </span>
          </div>
        )}

        {/* Text content */}
        <div style={{ flexGrow: 1, marginInlineStart: isCalendar ? '0' : '16px', textAlign: 'right', paddingRight: isCalendar ? '15px' : '0' }}>
          <h3 className="text-h3" style={{ color: 'var(--color-ink)', fontSize: 'clamp(15px, 4.2vw, 18px)', marginBottom: '4px' }}>{title}</h3>
          <p className="text-meta" style={{ color: 'var(--color-stone)', fontSize: 'clamp(10px, 2.8vw, 12px)', whiteSpace: 'pre-wrap' }} dir="auto">
            {meta.split(' • ').map((part, index, array) => (
              <span key={index}>
                <bdi>{part}</bdi>
                {index < array.length - 1 && (
                  <span style={{ fontSize: '9px', opacity: 0.6, margin: '0 8px' }}>•</span>
                )}
              </span>
            ))}
          </p>
        </div>

        {/* Calendar Blue Pill on the right */}
        {isCalendar && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '19px',
            background: 'linear-gradient(to right, var(--color-primary-500), var(--color-primary-600))',
            borderRadius: '6px',
          }} />
        )}
      </Link>
    </div>
  );
}
