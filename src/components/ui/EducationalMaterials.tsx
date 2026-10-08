"use client";
import React, { useEffect, useState } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  meta: string;
  coverUrl: string;
  pdfUrl: string;
}

const CATEGORIES = [
  { key: 'balagha', label: 'البلاغة' },
  { key: 'qiraah', label: 'القراءة' },
  { key: 'tawheed', label: 'التوحيد' },
  { key: 'kitaba', label: 'الكتابة' },
  { key: 'nahw', label: 'النحو' },
  { key: 'adab', label: 'تاريخ الأدب' },
  { key: 'indonesian', label: 'اللغة الإندونيسية' },
];

const toAbsolute = (url: string) => (url.startsWith('/') || url.startsWith('http') ? url : `/${url}`);

/**
 * Container "المواد التعليمية" - sama seperti yang ada di halaman المكتبة الرقمية (/materials).
 */
export default function EducationalMaterials() {
  const [activeCategory, setActiveCategory] = useState('balagha');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/books/educational')
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch(() => {
        setBooks([]);
        setLoading(false);
      });
  }, []);

  const filteredBooks = books.filter((book) => book.category === activeCategory);

  return (
    <section
      style={{
        padding: '27px calc(3% - 2px) 0px calc(3% - 2px)',
        backgroundColor: 'var(--color-surface-tint)',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <link rel="stylesheet" href="/dashboard.css" />
      <style>{`
        @keyframes pulseSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton-box {
          background-color: #cbd5e1;
          border-radius: 4px;
          animation: pulseSkeleton 1.5s ease-in-out infinite;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingRight: '10px' }}>
        <h2 className="text-h2" style={{ fontSize: 'clamp(20px, 6vw, 25px)', color: 'var(--color-ink)', margin: 0 }}>المواد التعليمية</h2>
        <a href="/materials#educational-materials" className="view-all-link" style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'none', fontWeight: 600, paddingLeft: '10px' }}>
          عرض الكل &rarr;
        </a>
      </div>

      <div className="main-card-section" style={{ marginBottom: 0 }}>
        <div className="category-buttons" style={{ marginBottom: '16px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`cat-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="book-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="book-row-card">
                <div className="book-row-right" style={{ width: '100%' }}>
                  <div className="skeleton-box" style={{ width: '56px', height: '80px', flexShrink: 0 }} />
                  <div className="book-row-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '12px' }}>
                    <div className="skeleton-box" style={{ height: '16px', width: '70%' }} />
                    <div className="skeleton-box" style={{ height: '12px', width: '40%' }} />
                    <div className="skeleton-box" style={{ height: '10px', width: '50%' }} />
                  </div>
                </div>
              </div>
            ))
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div key={book.id} className="book-row-card">
                <div className="book-row-right">
                  <img src={toAbsolute(book.coverUrl)} alt={book.title} className="book-row-cover" />
                  <div className="book-row-details">
                    <h3 className="book-row-title">{book.title}</h3>
                    <p className="book-row-author">{book.author}</p>
                    <span className="book-row-meta">{book.meta}</span>
                  </div>
                </div>
                <div className="book-row-actions">
                  <a href={toAbsolute(book.pdfUrl)} target="_blank" rel="noreferrer" className="action-icon-btn" title="قراءة">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </a>
                  <a href={toAbsolute(book.pdfUrl)} download className="action-icon-btn" title="تحميل">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>لا توجد كتب في هذا القسم حالياً</div>
          )}
        </div>
      </div>
    </section>
  );
}
