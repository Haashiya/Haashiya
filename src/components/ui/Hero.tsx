export default function Hero() {
  return (
    <section style={{
      height: '250px',
      width: '100%',
      backgroundImage: 'url(/images/hero_bg.png)',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      padding: '40px 30px 32px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start' /* RTL flex-start is visual right */
    }}>
      <div style={{ transform: 'translateY(-25px)' }}>
        <h1 className="text-h1" style={{ color: 'var(--color-white-text)', textAlign: 'right', fontSize: '35px', padding: '4px 0px 4px 0px' }}>
          <span style={{ color: 'var(--color-ink)' }}>بوابتنا</span> لتعلم اللغة العربية
        </h1>
        <p className="text-body" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
          الانخراط في أجواء التعلم في أي وقت ومكان
        </p>
      </div>
      <button className="text-button" style={{
        marginTop: '2px',
        marginRight: '-3px',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary-600)',
        borderRadius: '8px',
        padding: '7px 7px',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',


      }}>
        <span>ادرس الآن</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M19 12H5"></path>
          <path d="M11 19l-7-7 7-7"></path>
        </svg>
      </button>
    </section>
  );
}
