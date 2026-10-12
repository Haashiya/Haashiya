"use client";
import React, { useState, useEffect } from 'react';
import { useModals } from '@/contexts/ModalContext';

export default function ProfileDashboard() {
  const { showToast } = useModals();
  const [user, setUser] = useState<any>(null);
  
  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showUniPassword, setShowUniPassword] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newUniUser, setNewUniUser] = useState('');
  const [newUniPass, setNewUniPass] = useState('');
  
  // OTP states
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('currentUser');
    if (data) {
      const u = JSON.parse(data);
      setUser(u);
      setOtpEmail(u.email || '');
    }
  }, []);

  if (!user) return null;

  const docId = (user.username || (user.email ? user.email.split('@')[0] : '')).toLowerCase();

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const db = (window as any).db;
      await db.collection('users').doc(docId).set({
        name: newName.trim(),
        updatedAt: (window as any).firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString()
      }, { merge: true });
      
      const updatedUser = { ...user, name: newName.trim() };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setActiveModal(null);
      showToast('تم تحديث الاسم بنجاح');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء التحديث', true);
    }
  };

  const handleUniUserChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniUser.trim()) return;
    try {
      const db = (window as any).db;
      await db.collection('users').doc(docId).set({
        uni_username: newUniUser.trim(),
        updatedAt: (window as any).firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString()
      }, { merge: true });
      
      const updatedUser = { ...user, uni_username: newUniUser.trim() };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setActiveModal(null);
      showToast('تم تحديث اسم المستخدم الجامعي');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء التحديث', true);
    }
  };

  const handleUniPassChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniPass.trim()) return;
    try {
      const db = (window as any).db;
      await db.collection('users').doc(docId).set({
        uni_password: newUniPass.trim(),
        updatedAt: (window as any).firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString()
      }, { merge: true });
      
      const updatedUser = { ...user, uni_password: newUniPass.trim() };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setActiveModal(null);
      showToast('تم تحديث كلمة المرور الجامعية');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء التحديث', true);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) return;

    try {
      showToast('جاري التحقق...');
      const db = (window as any).db;
      const snapshot = await db.collection('users').where('email', '==', otpEmail.toLowerCase()).get();
      
      if (snapshot.empty) {
        showToast('عذراً، البريد الإلكتروني غير مسجل', true);
        return;
      }

      const userData = snapshot.docs[0].data();
      if (userData.lastPasswordChange) {
        const lastChange = userData.lastPasswordChange.toDate ? userData.lastPasswordChange.toDate() : new Date(userData.lastPasswordChange);
        const twoWeeks = 14 * 24 * 60 * 60 * 1000;
        if (Date.now() - lastChange.getTime() < twoWeeks) {
          showToast('يمكن تغيير كلمة المرور مرة واحدة كل أسبوعين', true);
          return;
        }
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpExpiry(Date.now() + 10 * 60 * 1000);

      const templateParams = {
        pass_code: code,
        to_email: otpEmail,
        to_name: otpEmail.split('@')[0]
      };

      if ((window as any).emailjs) {
        await (window as any).emailjs.send('service_87l9tyn', 'template_jhy7wcq', templateParams);
        setActiveModal('verifyOtp');
        showToast('تم إرسال رمز التحقق إلى بريدك!');
      } else {
        showToast('خدمة البريد غير متاحة حالياً', true);
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء إرسال الرمز', true);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) return;

    if (!generatedOtp || otpCode !== generatedOtp) {
      showToast('رمز التحقق غير صحيح', true);
      return;
    }
    if (otpExpiry && Date.now() > otpExpiry) {
      showToast('انتهت صلاحية الرمز، يرجى المحاولة مرة أخرى', true);
      return;
    }

    try {
      const db = (window as any).db;
      await db.collection('users').doc(docId).set({
        password: newPassword,
        lastPasswordChange: (window as any).firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString()
      }, { merge: true });

      const updatedUser = { ...user, password: newPassword };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setActiveModal(null);
      setGeneratedOtp(null);
      setOtpCode('');
      setNewPassword('');
      showToast('تم تغيير كلمة المرور بنجاح!');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تغيير كلمة المرور', true);
    }
  };

  return (
    <>
      <section className="hero-banner profile-hero">
        <div className="hero-content">
          <h1 className="hero-title">الملف الشخصي</h1>
        </div>
      </section>

      <main className="library-wrapper profile-wrapper">
        <div className="profile-card identity-card">
          <div className="card-label-row" onClick={() => { setNewName(user.name || ''); setActiveModal('name'); }} style={{ cursor: 'pointer' }}>
            <span className="profile-label-top">الاسم المعروض</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </div>
          <h2 className="profile-user-title">{user.name || '-'}</h2>
      
          <div className="gender-badge-container">
            <span className={"gender-badge gender-" + (user.gender || 'male')}>
              {user.gender === 'female' ? 'أنثى ♀' : 'رجل ♂'}
            </span>
          </div>
      
          <div className="detail-row" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <span className="detail-value">{user.studentId || '-'}</span>
            <span className="detail-label">الرقم الجامعي</span>
          </div>
        </div>
      
        <div className="profile-card">
          <div className="profile-details-list">
            <div className="detail-row">
              <span className="detail-value">{user.email || '-'}</span>
              <span className="detail-label">البريد الإلكتروني</span>
            </div>
            <div className="detail-row">
              <span className="detail-value">{user.username || '-'}</span>
              <span className="detail-label">اسم المستخدم</span>
            </div>
            <div className="detail-row">
              <div className="password-value-container">
                <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: showPassword ? 'none' : 'block' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: showPassword ? 'block' : 'none' }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
                <span className="detail-value">{showPassword ? (user.password || '-') : '••••••••'}</span>
              </div>
              <span className="detail-label">كلمة المرور</span>
            </div>
          </div>
      
          <div className="profile-actions">
            <button className="btn-profile-action" onClick={() => { setNewName(user.name || ''); setActiveModal('name'); }}>تغيير اسم المستخدم</button>
            <button className="btn-profile-action" onClick={() => setActiveModal('requestOtp')}>تغيير كلمة المرور</button>
          </div>
        </div>
      
        <div className="profile-card">
          <div className="profile-details-list">
            <div className="detail-row">
              <span className="detail-value">{user.uni_username || '-'}</span>
              <span className="detail-label">اسم المستخدم لموقع الجامعة</span>
            </div>
            <div className="detail-row">
              <div className="password-value-container">
                <button type="button" className="btn-toggle-password" onClick={() => setShowUniPassword(!showUniPassword)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: showUniPassword ? 'none' : 'block' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: showUniPassword ? 'block' : 'none' }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
                <span className="detail-value">{showUniPassword ? (user.uni_password || '-') : (user.uni_password ? '••••••••' : '-')}</span>
              </div>
              <span className="detail-label">كلمة مرور موقع الجامعة</span>
            </div>
          </div>
      
          <div className="profile-actions">
            <button className="btn-profile-action" onClick={() => { setNewUniUser(user.uni_username || ''); setActiveModal('uniUser'); }}>تغيير اسم المستخدم لموقع الجامعة</button>
            <button className="btn-profile-action" onClick={() => { setNewUniPass(user.uni_password || ''); setActiveModal('uniPass'); }}>تغيير كلمة المرور لموقع الجامعة</button>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {activeModal === 'name' && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }}>
          <div className="upload-modal-card">
            <button className="modal-close-x" onClick={() => setActiveModal(null)}>&times;</button>
            <h3 className="upload-modal-title">تغيير الاسم المعروض</h3>
            <p className="upload-modal-subtitle">أدخل الاسم الجديد الذي سيظهر في حسابك والمكتبة</p>
            <form onSubmit={handleNameChange}>
              <div className="modal-field">
                <label>الاسم الجديد</label>
                <input type="text" className="modal-input" required value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="upload-modal-actions">
                <button type="submit" className="btn-submit-upload">حفظ التغييرات</button>
                <button type="button" className="btn-cancel-upload" onClick={() => setActiveModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'uniUser' && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }}>
          <div className="upload-modal-card">
            <button className="modal-close-x" onClick={() => setActiveModal(null)}>&times;</button>
            <h3 className="upload-modal-title">تغيير اسم المستخدم لموقع الجامعة</h3>
            <form onSubmit={handleUniUserChange}>
              <div className="modal-field">
                <label>اسم المستخدم الجامعي</label>
                <input type="text" className="modal-input" required value={newUniUser} onChange={e => setNewUniUser(e.target.value)} />
              </div>
              <div className="upload-modal-actions">
                <button type="submit" className="btn-submit-upload">حفظ التغييرات</button>
                <button type="button" className="btn-cancel-upload" onClick={() => setActiveModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'uniPass' && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }}>
          <div className="upload-modal-card">
            <button className="modal-close-x" onClick={() => setActiveModal(null)}>&times;</button>
            <h3 className="upload-modal-title">تغيير كلمة مرور موقع الجامعة</h3>
            <form onSubmit={handleUniPassChange}>
              <div className="modal-field">
                <label>كلمة المرور الجامعية</label>
                <input type="text" className="modal-input" required value={newUniPass} onChange={e => setNewUniPass(e.target.value)} />
              </div>
              <div className="upload-modal-actions">
                <button type="submit" className="btn-submit-upload">حفظ التغييرات</button>
                <button type="button" className="btn-cancel-upload" onClick={() => setActiveModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'requestOtp' && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }}>
          <div className="upload-modal-card">
            <button className="modal-close-x" onClick={() => setActiveModal(null)}>&times;</button>
            <h3 className="upload-modal-title">تغيير كلمة المرور</h3>
            <p className="upload-modal-subtitle">أدخل بريدك الإلكتروني ليصلك رمز التحقق</p>
            <form onSubmit={handleSendOtp}>
              <div className="modal-field">
                <label>البريد الإلكتروني</label>
                <input type="email" className="modal-input" required value={otpEmail} onChange={e => setOtpEmail(e.target.value)} />
              </div>
              <div className="upload-modal-actions">
                <button type="submit" className="btn-submit-upload">إرسال رمز التحقق</button>
                <button type="button" className="btn-cancel-upload" onClick={() => setActiveModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'verifyOtp' && (
        <div className="upload-modal-overlay show" style={{ display: 'flex' }}>
          <div className="upload-modal-card">
            <button className="modal-close-x" onClick={() => setActiveModal(null)}>&times;</button>
            <h3 className="upload-modal-title">إدخال رمز التحقق</h3>
            <p className="upload-modal-subtitle">أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك</p>
            <form onSubmit={handleResetPassword}>
              <div className="modal-field">
                <label>رمز التحقق (OTP)</label>
                <input type="text" className="modal-input" maxLength={6} required value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }} />
              </div>
              <div className="modal-field">
                <label>كلمة المرور الجديدة</label>
                <input type="password" className="modal-input" minLength={6} required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="upload-modal-actions">
                <button type="submit" className="btn-submit-upload">تأكيد وتغيير كلمة المرور</button>
                <button type="button" className="btn-cancel-upload" onClick={() => setActiveModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
