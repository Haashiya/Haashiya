export default function GlossarySearch() {
  return (
    <div style={{
      background: 'linear-gradient(to right, var(--color-primary-500), var(--color-primary-600))',
      borderRadius: '12px',
      padding: '12px',
      minHeight: '160px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflow: 'hidden'
      }}>
        <input
          type="text"
          placeholder="بحث"
          className="text-body search-input"
          style={{
            flexGrow: 1,
            minWidth: 0,
            width: 0,
            height: '34px',
            border: 'none',
            outline: 'none',
            textAlign: 'right',
            color: 'var(--color-primary-500)',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '6px',
            padding: '0 12px',
            fontFamily: 'inherit',
            fontWeight: 'bold'
          }}
        />
        <div style={{
          width: '34px',
          height: '34px',
          backgroundColor: 'var(--color-ink)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-white-text)',
          fontSize: '30px',
          fontWeight: '600',
          lineHeight: 1,
          flexShrink: 0
        }}>
          +
        </div>
      </div>

      {/* Empty state decorative line */}
      <div style={{
        width: '1px',
        height: '90px',
        backgroundColor: '#061b3c',
        margin: '20px auto 0'
      }} />
    </div>
  );
}
