"use client";
import React, { useState, useEffect } from 'react';

const SUBJECT_NAMES: Record<string, string> = {
  balagha: "البلاغة",
  qiraah: "القراءة",
  tawheed: "التوحيد",
  kitaba: "الكتابة",
  nahw: "النحو",
  adab: "تاريخ الأدب",
  indonesian: "اللغة الإندونيسية",
  pkn: "التربية الوطنية"
};

interface Assignment {
  title: string;
  author: string;
  meta: string;
  coverUrl: string;
  pdfUrl: string;
  category: string;
}

export default function AssignmentsSection() {
  const [activeSubject, setActiveSubject] = useState('all');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/archive');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAssignments(data.assignments || []);
            setLoading(false);
          }
        } else {
          if (isMounted) setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching archive data:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchAssignments();
    return () => { isMounted = false; };
  }, []);

  const filteredAssignments = activeSubject === 'all' 
    ? assignments 
    : assignments.filter(a => (a.category || 'balagha') === activeSubject);

  return (
    <section id="assignments" className="main-card-section">
      <div className="section-header">
        <h2 className="section-title">أرشيف الواجبات</h2>
      </div>

      <div className="archive-filter-bar" style={{ marginTop: '16px' }}>
        <div className="category-buttons" style={{ marginBottom: 0 }}>
          <button className={`cat-btn ${activeSubject === 'all' ? 'active' : ''}`} onClick={() => setActiveSubject('all')}>
            الكل
          </button>
          {Object.entries(SUBJECT_NAMES).map(([key, label]) => (
            <button 
              key={key} 
              className={`cat-btn ${activeSubject === key ? 'active' : ''}`}
              onClick={() => setActiveSubject(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="book-list-container" style={{ marginTop: '20px' }}>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="book-row-card" style={{ opacity: 0.7 }}>
              <div className="book-row-right" style={{ width: '100%' }}>
                <div className="skeleton-box" style={{ width: '56px', height: '80px', flexShrink: 0 }}></div>
                <div className="book-row-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '12px' }}>
                  <div className="skeleton-box" style={{ height: '16px', width: '70%' }}></div>
                  <div className="skeleton-box" style={{ height: '12px', width: '40%' }}></div>
                  <div className="skeleton-box" style={{ height: '10px', width: '50%' }}></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredAssignments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', width: '100%', padding: '20px' }}>لا توجد واجبات لهذا القسم حالياً.</p>
        ) : (
          filteredAssignments.map((ass, i) => (
            <div key={i} className="book-row-card">
              <div className="book-row-right">
                <img src={ass.coverUrl.startsWith('/') || ass.coverUrl.startsWith('http') ? ass.coverUrl : `/${ass.coverUrl}`} alt={ass.title} className="book-row-cover" />
                <div className="book-row-details">
                  <h3 className="book-row-title">{ass.title}</h3>
                  <p className="book-row-author">{ass.author}</p>
                  <span className="book-row-meta">{ass.meta}</span>
                </div>
              </div>
              <div className="book-row-actions">
                <a href={ass.pdfUrl.startsWith('/') || ass.pdfUrl.startsWith('http') ? ass.pdfUrl : `/${ass.pdfUrl}`} target="_blank" rel="noreferrer" className="action-icon-btn" title="قراءة">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </a>
                <a href={ass.pdfUrl.startsWith('/') || ass.pdfUrl.startsWith('http') ? ass.pdfUrl : `/${ass.pdfUrl}`} download className="action-icon-btn" title="تحميل">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
