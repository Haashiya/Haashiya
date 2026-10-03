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
            <ServiceCard title="معرض الأرشيف" href="#" image="/images/card_galeriarsip.png" />
            <ServiceCard title="المكتبة الرقمية" href="#" image="/images/card_perpustakaandigital.png" />
            <ServiceCard title="المواد التعليمية" href="#" image="/images/card_bahanajar.png" />
            <ServiceCard title="التعلم المدعوم بالذكاء الاصطناعي" href="#" image="/images/card_ailearning.png" />
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
              <div className="book-row-card">
                <div className="book-row-right">
                  <img src="/assets/images/covers/nahwu_wadeeh_1.png" alt="النحو الواضح" className="book-row-cover" />
                  <div className="book-row-details">
                    <h3 className="book-row-title">النحو الواضح في قواعد اللغة العربية</h3>
                    <p className="book-row-author">علي الجارم ومصطفى أمين</p>
                    <span className="book-row-meta">المكتبة العامة - الفن: علم النحو</span>
                  </div>
                </div>
                <div className="book-row-actions">
                  <a href="/assets/pdfs/badee3tareekh.pdf" target="_blank" rel="noreferrer" className="action-icon-btn" title="قراءة">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </a>
                  <a href="/assets/pdfs/badee3tareekh.pdf" download className="action-icon-btn" title="تحميل">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </a>
                </div>
              </div>
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
