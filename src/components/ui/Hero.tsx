export default function Hero() {
  return (
    <section style={{
      height: '360px',
      backgroundImage: 'url(/images/hero_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px 20px 32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start' /* RTL flex-start is visual right */
    }}>
      <h1 className="text-h1" style={{ color: 'var(--color-white-text)', textAlign: 'right' }}>
        بوابتنا لتعلم<br/>اللغة العربية
      </h1>
      <p className="text-body" style={{ color: 'rgba(255,255,255,0.85)', marginTop: '8px' }}>
        الانخراط في أجواء التعلم في أي وقت ومكان
      </p>
      <button className="text-button" style={{
        marginTop: '20px',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary-600)',
        borderRadius: '24px',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>ادرس الآن</span>
        <span>&larr;</span>
      </button>
    </section>
  );
}
