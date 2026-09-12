import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/ui/Hero';
import SectionTitle from '@/components/ui/SectionTitle';
import ServiceCard from '@/components/ui/ServiceCard';
import ResourceItem from '@/components/ui/ResourceItem';
import GlossarySearch from '@/components/ui/GlossarySearch';

export default function Home() {
  return (
    <div className="mobile-container">
      <Navbar />

      <main>
        <Hero />

        {/* Section Layanan */}
        <section style={{ padding: '50px 3% 0px 3%' }}>
          <SectionTitle title="خدمات التعلم" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            <ServiceCard title="معرض الأرشيف" href="#" image="/images/card_galeriarsip.png" />
            <ServiceCard title="المكتبة الرقمية" href="#" image="/images/card_perpustakaandigital.png" />
            <ServiceCard title="المواد التعليمية" href="#" image="/images/card_bahanajar.png" />
            <ServiceCard title="التعلم المدعوم بالذكاء الاصطناعي" href="#" image="/images/card_ailearning.png" />
          </div>
        </section>

        {/* Section Bahan Ajar */}
        <section style={{ padding: '50px 3% 0px 3%', backgroundColor: 'var(--color-surface-tint)' }}>
          <SectionTitle title="المواد التعليمية" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ResourceItem title="البديع في ضوء أساليب القرآن" meta="المرجع الرئيس • مادة البلاغة" badgeType="PDF" />
            <ResourceItem title="مهارات القراءة والاستماع" meta="المرجع المساند • مادة القراءة" badgeType="DOCX" />
            <ResourceItem title="BAHASA INDONESIA AKADEMIK" meta="المرجع الرئيس • مادة اللغة الإندونيسية" badgeType="PDF" />
          </div>
        </section>

        {/* Section Glossary */}
        <section style={{ padding: '50px 3% 0px 3%' }}>
          <SectionTitle title="معجم المصطلحات" />
          <GlossarySearch />
        </section>

        {/* Section Kalender */}
        <section style={{ padding: '50px 3% 50px 3%', backgroundColor: 'var(--color-surface-tint)' }}>
          <SectionTitle title="التقويم الأكاديمي" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ResourceItem title="ورقة بحثية في تاريخ اللغة الإندونيسية" meta="مادة  Bahasa Indonesia • 15 Desember 2026" badgeType="CALENDAR" />
            <ResourceItem title="ورقة بحثية حول التنمية الذاتية" meta="مادة  PKN • 15 Desember 2026" badgeType="CALENDAR" />
            <ResourceItem title="عطلة عيد الميلاد" meta="عطلة • 25 Desember 2026" badgeType="CALENDAR" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
