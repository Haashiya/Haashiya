"use client";
import React, { useEffect, useState } from 'react';
import { useModals } from '@/contexts/ModalContext';

export default function GlobalModals() {
  const {
    isLogoutOpen, closeLogout,
    isNotificationsOpen, closeNotifications,
    isUploadOpen, closeUpload,
    isAdminQueueOpen, closeAdminQueue,
    isEditBookOpen, closeEditBook, editBookData,
    isDeleteBookOpen, closeDeleteBook, deleteBookId,
    toast, showToast
  } = useModals();

  const [pendingBooks, setPendingBooks] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  useEffect(() => {
    if (!isAdminQueueOpen) return;
    const fetchPending = async () => {
      setLoadingPending(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await fetch('/api/admin/pending', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const json = await res.json();
        if (res.ok) {
          setPendingBooks(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPending(false);
      }
    };
    fetchPending();
  }, [isAdminQueueOpen]);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setPendingBooks(prev => prev.filter(b => b.id !== id));
        showToast('تمت الموافقة على الكتاب بنجاح');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setPendingBooks(prev => prev.filter(b => b.id !== id));
        showToast('تم رفض طلب رفع الكتاب', true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const handleBookUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate upload
    showToast('تم طلب رفع الكتاب بنجاح! سيتم عرضه فور الموافقة عليه');
    closeUpload();
  };

  const handleDeleteBook = () => {
    // Simulate delete
    console.log('Deleting book:', deleteBookId);
    showToast('تم حذف الكتاب بنجاح');
    closeDeleteBook();
  };

  const handleEditBook = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate edit
    showToast('تم حفظ التعديلات بنجاح');
    closeEditBook();
  };

  return (
    <>
      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutOpen && (
        <div className="logout-modal-overlay show" style={{ display: 'flex' }} onClick={closeLogout}>
          <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">⚠️</div>
            <h3 className="logout-modal-title">تسجيل الخروج</h3>
            <p className="logout-modal-text">هل أنت تأكد من أنك تريد تسجيل الخروج؟</p>
            <div className="logout-modal-actions">
              <button className="logout-confirm-btn" onClick={handleLogout}>نعم، تسجيل الخروج</button>
              <button className="logout-cancel-btn" onClick={closeLogout}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD BOOK MODAL */}
      {isUploadOpen && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }} onClick={closeUpload}>
          <div className="upload-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={closeUpload}>&times;</button>
            <h3 className="upload-modal-title">إضافة كتاب جديد</h3>
            <p className="upload-modal-subtitle">قم برفع ملف PDF وصورة الغلاف للمساهمة في المكتبة العامة</p>

            <form onSubmit={handleBookUpload}>
              <div className="modal-field">
                <label htmlFor="bookTitle">عنوان الكتاب</label>
                <input type="text" id="bookTitle" className="modal-input" placeholder="أدخل اسم الكتاب..." required autoComplete="off" />
              </div>

              <div className="modal-field">
                <label htmlFor="bookAuthor">اسم المؤلف</label>
                <input type="text" id="bookAuthor" className="modal-input" placeholder="أدخل اسم المؤلف..." required autoComplete="off" />
              </div>

              <div className="modal-field">
                <label htmlFor="bookCategory">موضوع الكتاب / الفن</label>
                <select id="bookCategory" className="modal-select" required defaultValue="أخرى">
                  <option value="العقيدة">العقيدة</option>
                  <option value="الشرح">الشرح</option>
                  <option value="المتن">المتن</option>
                  <option value="اللغة">اللغة</option>
                  <option value="الأحكام الشرعية">الأحكام الشرعية</option>
                  <option value="التفسير">التفسير</option>
                  <option value="الحديث">الحديث</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="drop-zone" onClick={() => document.getElementById('pdfInput')?.click()}>
                <span className="drop-zone-text">اسحب ملف PDF الكتاب هنا أو <b>اختر من الجهاز</b></span>
                <input type="file" id="pdfInput" accept="application/pdf" style={{ display: 'none' }} />
              </div>

              <div className="drop-zone" onClick={() => document.getElementById('coverInput')?.click()}>
                <span className="drop-zone-text">اسحب صورة الغلاف (PNG/JPG) أو <b>اختر صورة</b></span>
                <input type="file" id="coverInput" accept="image/png, image/jpeg, image/jpg" style={{ display: 'none' }} />
              </div>

              <div className="upload-modal-actions">
                <button type="submit" className="btn-submit-upload">طلب رفع كتاب</button>
                <button type="button" className="btn-cancel-upload" onClick={closeUpload}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN APPROVAL QUEUE MODAL */}
      {isAdminQueueOpen && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }} onClick={closeAdminQueue}>
          <div className="upload-modal-card queue-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={closeAdminQueue}>&times;</button>
            <h3 className="upload-modal-title">طلبات المراجعة المعلقة</h3>
            <p className="upload-modal-subtitle">الموافقة أو الرفض على الكتب المرسلة من المستخدمين</p>
            <div className="pending-books-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {loadingPending ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="pending-item-card" style={{ opacity: 0.7 }}>
                    <div className="pending-item-left" style={{ width: '100%', display: 'flex', gap: '12px' }}>
                      <div className="skeleton-box" style={{ width: '40px', height: '56px', flexShrink: 0, borderRadius: '4px' }}></div>
                      <div className="pending-book-info" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
                        <div className="skeleton-box" style={{ height: '14px', width: '70%', borderRadius: '4px' }}></div>
                        <div className="skeleton-box" style={{ height: '10px', width: '50%', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                    <div className="pending-action-btns" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div className="skeleton-box" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
                      <div className="skeleton-box" style={{ width: '64px', height: '32px', borderRadius: '6px' }}></div>
                      <div className="skeleton-box" style={{ width: '64px', height: '32px', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                ))
              ) : pendingBooks.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>لا توجد طلبات معلقة</p>
              ) : (
                pendingBooks.map(book => (
                  <div key={book.id} className="pending-item-card">
                    <div className="pending-item-left">
                      <img src={book.coverUrl?.startsWith('/') || book.coverUrl?.startsWith('http') ? book.coverUrl : `/${book.coverUrl || 'assets/images/covers/badee3tareekh.png'}`} alt={book.title} className="pending-book-cover" />
                      <div className="pending-book-info">
                        <strong className="pending-book-title">{book.title}</strong>
                        <span className="pending-book-meta">المؤلف: {book.author} | الفن: {book.theme || 'أخرى'}</span>
                      </div>
                    </div>
            
                    <div className="pending-action-btns">
                      <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="action-icon-btn btn-view-pending" title="معاينة الكتاب">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </a>
                      <button className="btn-approve" onClick={() => handleApprove(book.id)} title="قبول الطلب">قبول</button>
                      <button className="btn-reject" onClick={() => handleReject(book.id)} title="رفض الطلب">رفض</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT BOOK MODAL */}
      {isEditBookOpen && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }} onClick={closeEditBook}>
          <div className="upload-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={closeEditBook}>&times;</button>
            <h3 className="upload-modal-title">تعديل معلومات الكتاب</h3>
            <p className="upload-modal-subtitle">تعديل اسم الكتاب، المؤلف، أو التصنيف</p>
            <form onSubmit={handleEditBook}>
              <div className="modal-field">
                <label>عنوان الكتاب</label>
                <input type="text" className="modal-input" defaultValue={editBookData?.title} required />
              </div>
              <div className="modal-field">
                <label>اسم المؤلف</label>
                <input type="text" className="modal-input" defaultValue={editBookData?.author} required />
              </div>
              <div className="upload-modal-actions">
                <button type="submit" className="btn-submit-upload">حفظ التغييرات</button>
                <button type="button" className="btn-cancel-upload" onClick={closeEditBook}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteBookOpen && (
        <div className="logout-modal-overlay show" style={{ display: 'flex' }} onClick={closeDeleteBook}>
          <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">🗑️</div>
            <h3 className="logout-modal-title">حذف الكتاب</h3>
            <p className="logout-modal-text">هل أنت تأكد من رغبتك في حذف هذا الكتاب بشكل نهائي من المكتبة العامة؟</p>
            <div className="logout-modal-actions">
              <button className="logout-confirm-btn" onClick={handleDeleteBook}>نعم، احذف الكتاب</button>
              <button className="logout-cancel-btn" onClick={closeDeleteBook}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {isNotificationsOpen && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }} onClick={closeNotifications}>
          <div className="upload-modal-card notifications-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={closeNotifications}>&times;</button>
            <div className="notifications-header">
              <h3 className="upload-modal-title">الإشعارات</h3>
              <button className="btn-clear-notifications">مسح الكل</button>
            </div>
            <p className="upload-modal-subtitle">سجل التحديثات وحالة طلبات إضافة الكتب</p>
            <div className="notifications-list-container">
              <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>لا توجد إشعارات</p>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast-notification show ${toast.isError ? 'toast-error' : ''}`} style={{ display: 'flex' }}>
          {toast.isError ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}
