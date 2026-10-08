'use client';

import React, { useRef, useState, useEffect } from 'react';
import './talim.css';

export default function TalimAIWorkspace() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userData, setUserData] = useState<{name: string, role: string, avatar: string, gender?: string} | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [showArtifacts, setShowArtifacts] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="talim-container" dir="rtl">
      
      {/* Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar (Claude Style) */}
      <aside className={`talim-sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsSidebarOpen(false)}
              title="توسيع/تصغير"
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                border: '1.5px solid var(--color-primary-600)',
              backgroundColor: 'transparent',
              color: 'var(--color-primary-600)',
              padding: 0,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              {/* Titik Atas */}
              <path d="M8 1L11.5 4.5L8 8L4.5 4.5Z" />
              {/* Titik Tengah (digeser ke bawah 1px) */}
              <path d="M8 4.5L11.5 8L8 11.5L4.5 8Z" transform="translate(0, 2)" />
              {/* Titik Bawah (digeser ke bawah 2px) */}
              <path d="M8 8L11.5 11.5L8 15L4.5 11.5Z" transform="translate(0, 4)" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="sidebar-title">حاشية</h1>
            <img src="/icon.png" alt="Logo" width="32" height="32" style={{ borderRadius: '8px', objectFit: 'cover' }} />
          </div>
        </div>

        <button className="new-chat-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          محادثة جديدة
        </button>

        <div className="sidebar-section">
          <div className="section-label">مساحة التعلم</div>
          
          {/* Books Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              className={`nav-item ${activeAccordion === 'books' ? 'active' : ''}`}
              onClick={() => setActiveAccordion(activeAccordion === 'books' ? null : 'books')}
              style={{ width: '100%', border: 'none', background: activeAccordion === 'books' ? 'rgba(36, 113, 234, 0.1)' : 'transparent', textAlign: 'right' }}
            >
              <svg className="icon-default" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <svg className="icon-hover" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              الكتب النشطة
            </button>
            {activeAccordion === 'books' && (
              <div className="accordion-content">
                <div className="accordion-item">📖 فتح المعين (باب الصلاة)</div>
                <div className="accordion-item">📖 الآجرومية (باب المبتدأ)</div>
              </div>
            )}
          </div>

          {/* History Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button 
              className={`nav-item ${activeAccordion === 'history' ? 'active' : ''}`}
              onClick={() => setActiveAccordion(activeAccordion === 'history' ? null : 'history')}
              style={{ width: '100%', border: 'none', background: activeAccordion === 'history' ? 'rgba(36, 113, 234, 0.1)' : 'transparent', textAlign: 'right' }}
            >
              <svg className="icon-default" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <svg className="icon-hover" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
              </svg>
              سجل المحادثات
            </button>
            {activeAccordion === 'history' && (
              <div className="accordion-content">
                <div className="accordion-item">🕒 أحكام القصر في السفر</div>
                <div className="accordion-item">🕒 شرح إعراب الجملة</div>
              </div>
            )}
          </div>

          {/* Artifacts Toggle */}
          <button 
            className={`nav-item ${showArtifacts ? 'active' : ''}`}
            onClick={() => setShowArtifacts(!showArtifacts)}
            style={{ width: '100%', border: 'none', background: showArtifacts ? 'rgba(36, 113, 234, 0.1)' : 'transparent', textAlign: 'right' }}
          >
            <svg className="icon-default" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <svg className="icon-hover" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"></path>
            </svg>
            الملاحظات (Artifacts)
          </button>
        </div>

        <div className="sidebar-spacer"></div>

        <div style={{ position: 'relative', width: '100%' }}>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#E5E9EC',
              padding: '6px 6px 6px 12px',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-arabic)',
              width: '100%',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Avatar */}
              <div style={{
                width: '32px', height: '32px', backgroundColor: '#1E3A8A', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                fontWeight: 700, fontSize: '12px', fontFamily: 'var(--font-base)', overflow: 'hidden',
                flexShrink: 0
              }}>
                {userData?.avatar && !userData.avatar.includes('default_avatar') ? (
                  <img src={userData.avatar.startsWith('/') ? userData.avatar : `/${userData.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img 
                    src={userData?.gender === 'female' 
                      ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jane&backgroundColor=ffdfbf' 
                      : 'https://api.dicebear.com/9.x/avataaars/svg?seed=John&backgroundColor=b6e3f4'} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                )}
              </div>
              
              {/* Name */}
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                {userData?.name || 'طالب علم'}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Role Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#BFDBFE',
                color: '#1E3A8A', padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                fontWeight: 600, marginTop: '2px', flexShrink: 0
              }}>
                <span>
                  {userData?.role === 'superadmin' ? 'مسؤول عام' : 
                   userData?.role === 'admin' ? 'مسؤول' : 'طالب'}
                </span>
              </div>
              
              {/* Caret */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Area & Split Screen Layout */}
      <div style={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }}>
        <main className="main-workspace" style={{ borderLeft: showArtifacts ? '1px solid #E5E9EC' : 'none' }}>
          <header className="top-bar">
            <div className="plan-badge">
              باقة الطالب · <a href="#">ترقية</a>
            </div>
            
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                title="إظهار القائمة"
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1L11.5 4.5L8 8L4.5 4.5Z" />
                  <path d="M8 4.5L11.5 8L8 11.5L4.5 8Z" transform="translate(0, 2)" />
                  <path d="M8 8L11.5 11.5L8 15L4.5 11.5Z" transform="translate(0, 4)" />
                </svg>
              </button>
            )}
          </header>

          <div className="center-content">
            <h1 className="greeting-title">
              أهلاً بك مجدداً في حاشية!
            </h1>

            <div className="input-wrapper">
              <textarea 
                ref={textareaRef}
                className="main-input" 
                placeholder="كيف يمكنني مساعدتك في دراستك اليوم؟"
                rows={1}
                dir="auto"
                onInput={handleInput}
              ></textarea>
              
              <div className="input-toolbar">
                <div className="toolbar-right">
                  <button className="icon-btn" title="إرفاق كتاب أو نص">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button className="icon-btn" title="تحديد الكتاب" style={{ display: 'flex', gap: '6px', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    تحديد المصدر
                  </button>
                </div>

                <div className="toolbar-left">
                  <div className="model-selector">
                    مستوى الذكاء: متوسط
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  <button className="icon-btn" title="تسجيل صوتي">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="22"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="prompt-chips-container">
              <div className="prompt-chip-claude">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                إعراب جملة
              </div>
              <div className="prompt-chip-claude">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                شرح متن
              </div>
              <div className="prompt-chip-claude">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                ترجمة للملايو
              </div>
              <div className="prompt-chip-claude">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                سؤال فقهي
              </div>
            </div>
          </div>
        </main>

        {/* Artifacts Split Screen Panel */}
        {showArtifacts && (
          <aside style={{
            width: '50%',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#111827' }}>جدول إعراب الفاتحة</h2>
              <button 
                onClick={() => setShowArtifacts(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '4px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div style={{
              flex: 1,
              border: '1px solid #E5E9EC',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              padding: '24px',
              textAlign: 'center'
            }}>
              {/* Placeholder for actual Artifact content */}
              <p>تخيل هنا جدول تفصيلي أو مخطط تم إنشاؤه بواسطة الذكاء الاصطناعي</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
