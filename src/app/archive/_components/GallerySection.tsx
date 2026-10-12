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

interface GalleryItem {
  imageUrl: string;
  date: string;
  meta: string;
  category: string;
}

interface GallerySectionProps {
  type: 'whiteboards' | 'photos';
  title: string;
}

export default function GallerySection({ type, title }: GallerySectionProps) {
  const [activeSubject, setActiveSubject] = useState('all');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/archive');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setItems(data[type] || []);
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

    fetchItems();
    return () => { isMounted = false; };
  }, [type]);

  const filteredItems = activeSubject === 'all' 
    ? items 
    : items.filter(a => (a.category || 'balagha') === activeSubject);

  return (
    <section id={type} className="main-card-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
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

      <div className="photos-grid" style={{ marginTop: '20px' }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="photo-card" style={{ opacity: 0.7 }}>
              <div className="skeleton-box" style={{ width: '100%', height: '120px', borderRadius: '6px' }}></div>
              <div className="skeleton-box" style={{ width: '60%', height: '12px', marginTop: '8px' }}></div>
              <div className="skeleton-box" style={{ width: '40%', height: '10px', marginTop: '4px' }}></div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', width: '100%', gridColumn: '1/-1', padding: '20px' }}>لا توجد صور لهذا القسم حالياً.</p>
        ) : (
          filteredItems.map((item, i) => (
            <div key={i} className="photo-card">
              <img src={item.imageUrl.startsWith('/') || item.imageUrl.startsWith('http') ? item.imageUrl : `/${item.imageUrl}`} alt="photo" className="photo-preview" />
              <div className="photo-date">{item.date}</div>
              <div className="photo-meta">{item.meta}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
