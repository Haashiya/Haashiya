"use client";
import React, { useState, useEffect } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  category?: string;
  coverUrl: string;
  pdfUrl: string;
  meta: string;
}

export default function UploadTab() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('balagha');
  const [coverUrl, setCoverUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const db = (window as any).db;
      if (!db) return;
      const snapshot = await db.collection('educational_materials').get();
      if (!snapshot.empty) {
        const fetchedBooks: Book[] = [];
        snapshot.forEach((doc: any) => {
          fetchedBooks.push({ id: doc.id, ...doc.data() });
        });
        setBooks(fetchedBooks);
      } else {
        // Fallback
        const res = await fetch('/data/books.json');
        if (res.ok) {
          const jsonData = await res.json();
          const list = Array.isArray(jsonData) ? jsonData : (jsonData.educational_materials || []);
          setBooks(list.map((b: any, i: number) => ({
            id: String(b.id || `json_${i}`),
            title: b.title || 'بدون عنوان',
            author: b.author || 'المحاضر',
            coverUrl: b.coverUrl || b.cover || '/assets/images/web/default_cover.png',
            pdfUrl: b.pdfUrl || b.pdf || b.fileUrl || '#',
            meta: b.meta || b.subjectTag || 'المواد التعليمية',
            category: b.category || 'balagha'
          })));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openModal = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setCategory(book.category || 'balagha');
      setCoverUrl(book.coverUrl || '');
      setPdfUrl(book.pdfUrl || '');
    } else {
      setEditingBook(null);
      setTitle('');
      setAuthor('');
      setCategory('balagha');
      setCoverUrl('');
      setPdfUrl('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = (window as any).db;
    const bookData = {
      title: title.trim(),
      author: author.trim(),
      category,
      coverUrl: coverUrl.trim(),
      pdfUrl: pdfUrl.trim(),
      updatedAt: (window as any).firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString()
    };

    try {
      if (editingBook && !editingBook.id.startsWith('json_')) {
        await db.collection('educational_materials').doc(editingBook.id).set(bookData, { merge: true });
      } else {
        await db.collection('educational_materials').add(bookData);
      }
      closeModal();
      fetchBooks();
      alert('تم حفظ البيانات بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('هل أنت تأكد من أنك تريد حذف هذا الكتاب؟')) return;
    try {
      if (!bookId.startsWith('json_')) {
        await (window as any).db.collection('educational_materials').doc(bookId).delete();
      }
      setBooks(prev => prev.filter(b => b.id !== bookId));
      alert('تم حذف الكتاب بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <section className="tab-section active">
      <div className="admin-section-actions">
        <span className="tab-header-badge">المواد التعليمية</span>
        <button className="btn-add-book" onClick={() => openModal()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          إضافة كتاب جديد
        </button>
      </div>
    
      <div className="tab-card-body">
        <div className="admin-book-list">
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>جاري تحميل الكتب...</p>
          ) : books.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>لا توجد كتب مضافة حالياً.</p>
          ) : (
            books.map(book => (
              <div key={book.id} className="book-row-card">
                <div className="book-row-right">
                  <img src={book.coverUrl.startsWith('/') || book.coverUrl.startsWith('http') ? book.coverUrl : `/${book.coverUrl}`} alt={book.title} className="book-row-cover" />
                  <div className="book-row-details">
                    <h3 className="book-row-title">{book.title}</h3>
                    <p className="book-row-author">{book.author}</p>
                    <span className="book-row-meta">{book.meta || (book.category ? `المادة - ${book.category}` : 'المرجع الرئيسي')}</span>
                  </div>
                </div>
                <div className="book-row-actions admin-row-actions">
                  <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="action-icon-btn" title="قراءة">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </a>
                  <a href={book.pdfUrl} download className="action-icon-btn" title="تحميل">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </a>
                  <span className="admin-action-divider"></span>
                  <button className="action-icon-btn admin-btn-edit" onClick={() => openModal(book)} title="تعديل">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className="action-icon-btn admin-btn-delete" onClick={() => handleDelete(book.id)} title="حذف">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay show" style={{ display: 'flex' }}>
          <div className="admin-modal-card">
            <button className="modal-close-x" onClick={closeModal} style={{ position: 'absolute', left: '16px', top: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>{editingBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}</h3>
            
            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label>عنوان الكتاب</label>
                <input type="text" className="admin-input" placeholder="مثال: البديع في ضوء أساليب القرآن" required value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label>المؤلف / الدكتور</label>
                <input type="text" className="admin-input" placeholder="مثال: د. عبد الفتاح لاشين" required value={author} onChange={e => setAuthor(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label>المادة / المقرر</label>
                <select className="admin-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="balagha">البلاغة</option>
                  <option value="qiraah">القراءة</option>
                  <option value="tawheed">التوحيد</option>
                  <option value="kitaba">الكتابة</option>
                  <option value="nahw">النحو</option>
                  <option value="adab">تاريخ الأدب</option>
                  <option value="indonesian">اللغة الإندونيسية</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>رابط غلاف الكتاب (Cover Image URL)</label>
                <input type="url" className="admin-input" placeholder="https://..." required value={coverUrl} onChange={e => setCoverUrl(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label>رابط ملف الـ PDF</label>
                <input type="url" className="admin-input" placeholder="https://..." required value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} />
              </div>
              <button type="submit" className="admin-btn-submit" style={{ marginTop: '10px' }}>حفظ الكتاب</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
