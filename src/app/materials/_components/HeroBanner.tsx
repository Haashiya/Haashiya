"use client";
import React from 'react';

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-white">المكتبة</span>
            <span className="title-dark">الرقمية</span>
          </h1>
          <p className="hero-subtitle">
            رف كتب رقمي يضم مجموعة من المراجع المساندة الداعمة للدراسة الجامعية
          </p>

          <div className="search-container">
            <input
              type="text"
              id="searchInput"
              placeholder="اكتب للبحث عن كتاب..."
              onKeyUp={() => {
                if (typeof window !== 'undefined' && (window as any).filterBooks) {
                  (window as any).filterBooks();
                }
              }}
            />
            <button className="search-btn" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
