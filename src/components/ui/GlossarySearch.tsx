export default function GlossarySearch() {
  return (
    <div style={{
      backgroundColor: 'var(--color-primary-600)',
      borderRadius: '16px',
      padding: '20px',
      minHeight: '160px'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '24px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--color-ink)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-white-text)',
          fontSize: '20px',
          lineHeight: 1
        }}>
          +
        </div>
        <input 
          type="text" 
          placeholder="بحث" 
          className="text-body"
          style={{
            border: 'none',
            outline: 'none',
            textAlign: 'right',
            color: 'var(--color-ink)',
            width: '100%',
            backgroundColor: 'transparent',
            paddingInlineEnd: '12px',
            fontFamily: 'inherit'
          }}
        />
      </div>
      
      {/* Empty state decorative line */}
      <div style={{
        width: '1px',
        height: '60px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        margin: '20px auto 0'
      }} />
    </div>
  );
}
