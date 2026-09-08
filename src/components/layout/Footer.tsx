import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{
      backgroundImage: 'url(/images/footer_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      color: 'rgba(255,255,255,0.75)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <Image src="/images/footer_logo.png" alt="حاشية (Haashiya)" width={120} height={48} style={{ objectFit: 'contain' }} priority />
      </div>
      <p style={{
        color: 'rgba(255,255,255,0.85)',
        margin: '0 0 40px 0',
        fontSize: '16px',
        lineHeight: 1.3
      }}>
        موقع إلكتروني غير ربحي يهدف إلى تلبية احتياجات التعلم<br />لطلاب برنامج الأدب العربي في LIPIA (الدفعة التاسعة عشرة)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '14px', alignItems: 'center' }}>
        <span style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontWeight: 650 }}>من تطوير</span>
          <span dir="ltr" className="font-latin">@iqlbaihaqi_</span>
        </span>
        <span style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontWeight: 650 }}>من تصميم</span>
          <span dir="ltr" className="font-latin">@anggareksa__</span>
        </span>
      </div>
    </footer>
  );
}
