import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/ui/Hero';
import SectionTitle from '@/components/ui/SectionTitle';
import ServiceCard from '@/components/ui/ServiceCard';
import ResourceItem from '@/components/ui/ResourceItem';
import GlossarySearch from '@/components/ui/GlossarySearch';
import EducationalMaterials from '@/components/ui/EducationalMaterials';

export default function Home() {
  return (
    <div className="mobile-container">
      <Navbar />

      <main>
        <Hero />

        {/* Section Layanan */}
        <section style={{ padding: '50px calc(3% - 2px) 0px calc(3% - 2px)' }}>
          <SectionTitle title="خدمات التعلم" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            <ServiceCard title="معرض الأرشيف" href="/archive" image="/images/card_galeriarsip.png" />
            <ServiceCard title="المكتبة الرقمية" href="/materials" image="/images/card_perpustakaandigital.png" />
            <ServiceCard title="المواد التعليمية" href="/materials#educational-materials" image="/images/card_bahanajar.png" />
            <ServiceCard title="التعلم المدعوم بالذكاء الاصطناعي" href="#coming-soon" image="/images/card_ailearning.png" />
          </div>
        </section>

        {/* Section Mawwad Talim (container sama seperti Maktabah Raqmiyyah) */}
        <EducationalMaterials />

        {/* Section Maktabah Ammah (General Library) */}
        <section style={{ padding: '27px calc(3% - 2px) 0px calc(3% - 2px)', backgroundColor: 'var(--color-surface-tint)', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingRight: '10px' }}>
            <h2 className="text-h2" style={{ fontSize: 'clamp(20px, 6vw, 25px)', color: 'var(--color-ink)', margin: 0 }}>المكتبة العامة</h2>
            <a href="/materials#general-library" className="view-all-link" style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'none', fontWeight: 600, paddingLeft: '10px' }}>
              عرض الكل &rarr;
            </a>
          </div>

          <div className="main-card-section" style={{ marginBottom: 0 }}>
            <div className="book-list-container">
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>لا توجد كتب في هذا القسم حالياً</div>
            </div>
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
