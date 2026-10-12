"use client";
import React, { useEffect, useState } from 'react';
import { useModals } from '@/contexts/ModalContext';

interface Book {
  id: string;
  title: string;
  author: string;
  theme?: string;
  category?: string;
  coverUrl: string;
  pdfUrl: string;
}

const toAbsolute = (url: string) => (url.startsWith('/') || url.startsWith('http') ? url : `/${url}`);
const escapeHtml = (value: string) => String(value == null ? '' : value);

export default function GeneralLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  const { openAdminQueue, openUpload, openDeleteBook } = useModals();

  useEffect(() => {
    // Check session
    const sessionData = localStorage.getItem('currentUser');
    if (sessionData) {
      try {
        const user = JSON.parse(sessionData);
        if (user.role === 'admin' || user.role === 'superadmin') {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load Approved Books
    const loadApprovedBooks = async () => {
      try {
        const res = await fetch('/api/books/approved');
        const json = await res.json();
        if (res.ok) {
          setBooks(json.data || []);
        } else {
          console.error('Failed to load approved books:', json.error);
        }
      } catch (err) {
        console.error('Load approved books error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadApprovedBooks();
  }, []);

  // Simplified fetch for pending count (if admin)
  useEffect(() => {
    if (!isAdmin) return;

    const getValidAuthToken = () => {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      try {
        const payload = JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && payload.exp < Date.now()) {
          localStorage.removeItem('authToken');
          return null;
        }
      } catch (e) {
        return null;
      }
      return token;
    };

    const fetchPendingBooks = async () => {
      try {
        const token = getValidAuthToken();
        if (!token) return;
        const res = await fetch('/api/admin/pending', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const json = await res.json();
        if (res.ok) {
          setPendingCount(json.data?.length || 0);
        }
      } catch (err) {
        console.error('Pending count error:', err);
      }
    };

    fetchPendingBooks();
  }, [isAdmin]);

  return (
    <section id="general-library" className="main-card-section">
      <div className="section-header">
        <h2 className="section-title">المكتبة العامة</h2>
        
        <div className="section-actions">
          {isAdmin && (
            <button 
              id="adminQueueBtn" 
              className="btn-pending-queue" 
              onClick={openAdminQueue}
              title="قائمة المراجعة"
            >
              <img src="/assets/images/web/approvalqueue_icon.png" alt="Pending Queue" className="sandglass-icon" />
              <span id="pendingBadgeCount" className="pending-count">{pendingCount}</span>
            </button>
          )}
        
          <button 
            className="btn-add-book" 
            onClick={openUpload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            طلب إضافة كتاب
          </button>
          
          <a 
            href="/category-view?cat=general" 
            className="view-all-link" 
          >
            عرض الكل &rarr;
          </a>
        </div>
      </div>

      <div className="book-list-container">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
        ) : books.length > 0 ? (
          books.map((book) => {
            const theme = book.category || book.theme || '';
            const coverImage = book.coverUrl || 'assets/images/covers/badee3tareekh.png';

            return (
              <div key={book.id} className="book-row-card user-approved-card" data-category="general">
                <div className="book-row-right">
                  <img src={toAbsolute(coverImage)} alt={book.title} className="book-row-cover" />
                  <div className="book-row-details">
                    <h3 className="book-row-title">{escapeHtml(book.title)}</h3>
                    <p className="book-row-author">{escapeHtml(book.author)}</p>
                    <span className="book-row-meta">المكتبة العامة - الفن: {escapeHtml(theme)}</span>
                  </div>
                </div>
                <div className="book-row-actions">
                  {isAdmin && (
                    <button 
                      className="action-icon-btn admin-delete-btn" 
                      onClick={() => openDeleteBook(book.id)} 
                      title="حذف الكتاب"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                  <a href={toAbsolute(book.pdfUrl)} target="_blank" rel="noreferrer" className="action-icon-btn" title="قراءة">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </a>
                  <a href={toAbsolute(book.pdfUrl)} download={`${book.title}.pdf`} className="action-icon-btn" title="تحميل">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>لا توجد كتب في هذا القسم حالياً</div>
        )}
      </div>
    </section>
  );
}
