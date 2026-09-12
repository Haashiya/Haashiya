export default function Hero() {
  return (
    <section style={{
      aspectRatio: '480 / 250',
      width: '100%',
      height: 'auto',
      backgroundImage: 'url(/images/hero_bg.png)',
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      padding: '8.33cqi 6.25cqi 6.66cqi 4.16cqi',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start' /* RTL flex-start is visual right */
    }}>
      <div style={{ transform: 'translateY(-5.2cqi)' }}>
        <h1 className="text-h1" style={{ color: 'var(--color-white-text)', textAlign: 'right', fontSize: '7.29cqi', padding: '0.83cqi 0px 0.83cqi 0px' }}>
          <span style={{ color: 'var(--color-ink)' }}>بوابتنا</span> لتعلم اللغة العربية
        </h1>
        <p className="text-body" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '3.33cqi' }}>
          الانخراط في أجواء التعلم في أي وقت ومكان
        </p>
      </div>
      <button className="text-button" style={{
        marginTop: '0.41cqi',
        marginRight: '-0.62cqi',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary-600)',
        borderRadius: '1.66cqi',
        padding: '1.45cqi 1.45cqi',
        fontSize: '3.125cqi',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25cqi',
      }}>
        <span>ادرس الآن</span>
        <svg width="2.7cqi" height="2.7cqi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <path d="M19 12H5"></path>
          <path d="M11 19l-7-7 7-7"></path>
        </svg>
      </button>
    </section>
  );
}
