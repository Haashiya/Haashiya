export default function Hero() {
  return (
    <section style={{
      height: '290px',
      width: '100%',
      backgroundImage: 'url(/images/hero_bg.png)',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      padding: '40px 20px 32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start' /* RTL flex-start is visual right */
    }}>
      <h1 className="text-h1" style={{ color: 'var(--color-white-text)', textAlign: 'right', fontSize: '37px', marginTop: '-25px' }}>
        <span style={{ color: 'var(--color-ink)' }}>بوابتنا</span> لتعلم اللغة العربية
      </h1>
      <p className="text-body" style={{ color: 'rgba(255,255,255,0.85)', marginTop: '8px' }}>
        الانخراط في أجواء التعلم في أي وقت ومكان
      </p>
      <button className="text-button" style={{
        marginTop: '40px',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary-600)',
        borderRadius: '10px',
        padding: '8px 8px',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',


      }}>
        <span>ادرس الآن</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M19 12H5"></path>
          <path d="M11 19l-7-7 7-7"></path>
        </svg>
      </button>
    </section>
  );
}
