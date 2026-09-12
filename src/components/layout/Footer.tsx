import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{
      height: '200px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundImage: 'url(/images/footer_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px 30px',
      textAlign: 'start',
      color: 'rgba(255,255,255,0.75)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', transform: 'translate(-2px, 4px)' }}>
        <Image src="/images/footer_logo.png" alt="حاشية (Haashiya)" width={118} height={46} style={{ objectFit: 'contain' }} priority />
      </div>
      <p style={{
        color: 'rgba(255,255,255,0.85)',
        margin: '0 0 40px 0',
        fontSize: '16px',
        lineHeight: 1.3,
        transform: 'translateY(-1px)'
      }}>
        موقع إلكتروني غير ربحي يهدف إلى تلبية احتياجات التعلم<br />لطلاب برنامج الأدب العربي في LIPIA (الدفعة التاسعة عشرة)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '13px', alignItems: 'flex-start', lineHeight: 1.3, transform: 'translateY(-2px)' }}>
        <span style={{ display: 'flex', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <span style={{ fontWeight: 650 }}>من تطوير</span>
          <span dir="ltr" className="font-latin">@iqlbaihaqi_</span>
        </span>
        <span style={{ display: 'flex', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <span style={{ fontWeight: 650 }}>من تصميم</span>
          <span dir="ltr" className="font-latin">@anggareksa__</span>
        </span>
      </div>
    </footer>
  );
}
