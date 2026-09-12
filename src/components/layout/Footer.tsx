import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{
      height: 'clamp(180px, 45vw, 200px)', // Tinggi proporsional
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundImage: 'url(/images/footer_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px 6%', // Pakai persen agar proporsional
      textAlign: 'start',
      color: 'rgba(255,255,255,0.75)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', transform: 'translate(-2px, 4px)' }}>
        <Image src="/images/footer_logo.png" alt="حاشية (Haashiya)" width={118} height={46} style={{ objectFit: 'contain', width: 'clamp(90px, 25vw, 118px)', height: 'auto' }} priority />
      </div>
      <p style={{
        color: 'rgba(255,255,255,0.85)',
        margin: '0 0 40px 0',
        fontSize: 'clamp(13px, 3.8vw, 16px)', // Font proporsional
        lineHeight: 1.3,
        transform: 'translateY(-1px)'
      }}>
        موقع إلكتروني غير ربحي يهدف إلى تلبية احتياجات التعلم<br />لطلاب برنامج الأدب العربي في LIPIA (الدفعة التاسعة عشرة)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: 'clamp(11px, 3vw, 13px)', alignItems: 'flex-start', lineHeight: 1.3, transform: 'translateY(-2px)' }}>
        <span style={{ display: 'flex', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <span style={{ fontWeight: 650 }}>من تطوير</span>
          <span dir="ltr" className="font-latin"> @iqlbaihaqi_ & @aleefkhaer   </span>
        </span>
        <span style={{ display: 'flex', gap: '4px', justifyContent: 'flex-start', alignItems: 'center' }}>
          <span style={{ fontWeight: 650 }}>من تصميم</span>
          <span dir="ltr" className="font-latin">@anggareksa__ </span>
        </span>
      </div>
    </footer>
  );
}
