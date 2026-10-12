"use client";
import React, { useState, useEffect } from 'react';

interface PendingBook {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  pdfUrl: string;
}

export default function ApprovalTab() {
  const [pendingBooks, setPendingBooks] = useState<PendingBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const res = await fetch('/api/admin/pending', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const json = await res.json();
        if (res.ok && isMounted) {
          setPendingBooks(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPending();
    return () => { isMounted = false; };
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/approve?id=${id}`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        setPendingBooks(prev => prev.filter(b => b.id !== id));
        alert('تمت الموافقة بنجاح');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/reject?id=${id}`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        setPendingBooks(prev => prev.filter(b => b.id !== id));
        alert('تم الرفض بنجاح');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="tab-section active">
      <span className="tab-header-badge">طلبات المكتبة العامة</span>
      <div className="tab-card-body">
        <div className="admin-book-list">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</p>
          ) : pendingBooks.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>لا توجد طلبات معلقة حالياً</p>
          ) : (
            pendingBooks.map(book => (
              <div key={book.id} className="book-row-card">
                <div className="book-row-right">
                  <img src={book.coverUrl.startsWith('/') || book.coverUrl.startsWith('http') ? book.coverUrl : `/${book.coverUrl}`} alt={book.title} className="book-row-cover" />
                  <div className="book-row-details">
                    <h3 className="book-row-title">{book.title}</h3>
                    <p className="book-row-author">{book.author}</p>
                    <span className="book-row-meta">المكتبة العامة - {book.category}</span>
                  </div>
                </div>
                <div className="book-row-actions admin-row-actions">
                  <button onClick={() => handleApprove(book.id)} className="action-icon-btn" style={{ color: '#22c55e', backgroundColor: '#dcfce7' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <button onClick={() => handleReject(book.id)} className="action-icon-btn" style={{ color: '#ef4444', backgroundColor: '#fee2e2' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
