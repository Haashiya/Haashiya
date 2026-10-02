"use client";
import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Jika BELUM login, tendang ke halaman login
    if (!localStorage.getItem('currentUser')) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="mobile-container">
      <Navbar />
      <link rel="stylesheet" href="/dashboard.css" />
      <link rel="stylesheet" href="/profile.css" />
      <div dangerouslySetInnerHTML={{ __html: `
  

 

 

  <!-- HERO BANNER -->
  <section class="hero-banner profile-hero">
      <div class="hero-content">
        <h1 class="hero-title">الملف الشخصي</h1>
      </div>
  </section>

  <!-- PROFILE CONTENT -->
  <main class="library-wrapper profile-wrapper">

    <!-- 1. TOP CARD: IDENTITY & UNIVERSITY ID -->
    <div class="profile-card identity-card">
      <div class="card-label-row" onclick="openNameModal()" style="cursor: pointer;">
        <span class="profile-label-top">الاسم المعروض</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </div>
      <h2 id="profileDisplayName" class="profile-user-title">-</h2>
  
      <div class="gender-badge-container">
        <span id="profileGenderBadge" class="gender-badge gender-male">رجل ♂</span>
      </div>
  
      <div class="detail-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        <span class="detail-value" id="profileStudentId">-</span>
        <span class="detail-label">الرقم الجامعي</span>
      </div>
    </div>
  
    <!-- 2. MIDDLE CARD: MAIN ACCOUNT DETAILS -->
    <div class="profile-card">
      <div class="profile-details-list">
        <div class="detail-row">
          <span class="detail-value" id="profileEmail">-</span>
          <span class="detail-label">البريد الإلكتروني</span>
        </div>
        <div class="detail-row">
          <span class="detail-value" id="profileUsername">-</span>
          <span class="detail-label">اسم المستخدم</span>
        </div>
        <div class="detail-row">
          <div class="password-value-container">
            <button type="button" class="btn-toggle-password" onclick="togglePasswordVisibility()" title="إظهار/إخفاء كلمة المرور">
              <svg id="eyeOpenIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg id="eyeOffIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
            <span class="detail-value" id="profilePassword">••••••••</span>
          </div>
          <span class="detail-label">كلمة المرور</span>
        </div>
      </div>
  
      <div class="profile-actions">
        <button class="btn-profile-action" onclick="openNameModal()">تغيير اسم المستخدم</button>
        <button class="btn-profile-action" onclick="openChangePasswordModal()">تغيير كلمة المرور</button>
      </div>
    </div>
  
    <!-- 3. BOTTOM CARD: UNIVERSITY PORTAL CREDENTIALS -->
    <div class="profile-card">
      <div class="profile-details-list">
        <div class="detail-row">
          <span class="detail-value" id="uniUsernameValue">-</span>
          <span class="detail-label">اسم المستخدم لموقع الجامعة</span>
        </div>
        <div class="detail-row">
          <div class="password-value-container">
            <button type="button" class="btn-toggle-password" onclick="toggleUniPasswordVisibility()" title="إظهار/إخفاء كلمة المرور">
              <svg id="eyeOpenIconUni" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg id="eyeOffIconUni" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
            <span class="detail-value" id="uniPasswordValue">-</span>
          </div>
          <span class="detail-label">كلمة مرور موقع الجامعة</span>
        </div>
      </div>
  
      <div class="profile-actions">
        <button class="btn-profile-action" onclick="openUniUsernameModal()">تغيير اسم المستخدم لموقع الجامعة</button>
        <button class="btn-profile-action" onclick="openUniPasswordModal()">تغيير كلمة المرور لموقع الجامعة</button>
      </div>
    </div>
  
  </main>
  
  

  <!-- CHANGE DISPLAY NAME MODAL -->
  <div id="nameModal" class="upload-modal-overlay">
    <div class="upload-modal-card">
      <button class="modal-close-x" onclick="closeNameModal()">&times;</button>
      <h3 class="upload-modal-title">تغيير الاسم المعروض</h3>
      <p class="upload-modal-subtitle">أدخل الاسم الجديد الذي سيظهر في حسابك والمكتبة</p>
  
      <form onsubmit="handleNameChange(event)">
        <div class="modal-field">
          <label for="newDisplayNameInput">الاسم الجديد</label>
          <input type="text" id="newDisplayNameInput" class="modal-input" placeholder="أدخل الاسم الجديد..." required autocomplete="off">
        </div>
  
        <div class="upload-modal-actions">
          <button type="submit" class="btn-submit-upload">حفظ التغييرات</button>
          <button type="button" class="btn-cancel-upload" onclick="closeNameModal()">إلغاء</button>
        </div>
      </form>
    </div>
  </div>

  <!-- NOTIFICATIONS MODAL -->
  <div id="notificationsModal" class="upload-modal-overlay">
    <div class="upload-modal-card notifications-modal-card">
      <button class="modal-close-x" onclick="closeNotificationsModal()">&times;</button>
  
      <div class="notifications-header">
        <h3 class="upload-modal-title">الإشعارات</h3>
        <button class="btn-clear-notifications" onclick="clearAllNotifications()">مسح الكل</button>
      </div>
      <p class="upload-modal-subtitle">التحديثات والتنبيهات الخاصة بحسابك ومساهماتك</p>
  
      <div id="notificationsList" class="notifications-list-container">
        <!-- Dynamic notification items populated by JS -->
      </div>
    </div>
  </div>

  <!-- MODAL 1: REQUEST OTP CODE -->
  <div id="requestOtpModal" class="upload-modal-overlay">
    <div class="upload-modal-card">
      <button class="modal-close-x" onclick="closeOtpModal('requestOtpModal')">&times;</button>
      <h3 class="upload-modal-title">تغيير كلمة المرور</h3>
      <p class="upload-modal-subtitle">أدخل بريدك الإلكتروني ليصلك رمز التحقق</p>
  
      <form id="requestOtpForm" onsubmit="handleSendOtp(event)">
        <div class="modal-field">
          <label for="otpEmailInput">البريد الإلكتروني</label>
          <input type="email" id="otpEmailInput" class="modal-input" placeholder="example@domain.com" required>
        </div>
        <div class="upload-modal-actions">
          <button type="submit" class="btn-submit-upload">إرسال رمز التحقق</button>
          <button type="button" class="btn-cancel-upload" onclick="closeOtpModal('requestOtpModal')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL 2: ENTER OTP CODE & NEW PASSWORD -->
  <div id="verifyOtpModal" class="upload-modal-overlay">
    <div class="upload-modal-card">
      <button class="modal-close-x" onclick="closeOtpModal('verifyOtpModal')">&times;</button>
      <h3 class="upload-modal-title">إدخال رمز التحقق</h3>
      <p class="upload-modal-subtitle">أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك</p>
  
      <form id="verifyOtpForm" onsubmit="handleResetPassword(event)">
        <div class="modal-field">
          <label for="otpCodeInput">رمز التحقق (OTP)</label>
          <input type="text" id="otpCodeInput" class="modal-input" maxlength="6" placeholder="123456" required style="letter-spacing: 4px; text-align: center; font-weight: bold;">
        </div>
  
        <div class="modal-field">
          <label for="newPasswordInput">كلمة المرور الجديدة</label>
          <input type="password" id="newPasswordInput" class="modal-input" placeholder="••••••••" required minlength="6">
        </div>
  
        <div class="upload-modal-actions">
          <button type="submit" class="btn-submit-upload">تأكيد وتغيير كلمة المرور</button>
          <button type="button" class="btn-cancel-upload" onclick="closeOtpModal('verifyOtpModal')">إلغاء</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: CHANGE UNIVERSITY USERNAME -->
<div id="uniUsernameModal" class="upload-modal-overlay">
    <div class="upload-modal-card">
      <button class="modal-close-x" onclick="closeUniUsernameModal()">&times;</button>
      <h3 class="upload-modal-title">تغيير اسم المستخدم لموقع الجامعة</h3>
      <p class="upload-modal-subtitle">أدخل اسم المستخدم الخاص بحسابك الجامعي</p>
  
      <form onsubmit="handleUniUsernameChange(event)">
        <div class="modal-field">
          <label for="newUniUsernameInput">اسم المستخدم الجامعي</label>
          <input type="text" id="newUniUsernameInput" class="modal-input" placeholder="أدخل اسم المستخدم..." required autocomplete="off">
        </div>
  
        <div class="upload-modal-actions">
          <button type="submit" class="btn-submit-upload">حفظ التغييرات</button>
          <button type="button" class="btn-cancel-upload" onclick="closeUniUsernameModal()">إلغاء</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- MODAL: CHANGE UNIVERSITY PASSWORD -->
  <div id="uniPasswordModal" class="upload-modal-overlay">
    <div class="upload-modal-card">
      <button class="modal-close-x" onclick="closeUniPasswordModal()">&times;</button>
      <h3 class="upload-modal-title">تغيير كلمة مرور موقع الجامعة</h3>
      <p class="upload-modal-subtitle">أدخل كلمة المرور الخاصة بحسابك الجامعي</p>
  
      <form onsubmit="handleUniPasswordChange(event)">
        <div class="modal-field">
          <label for="newUniPasswordInput">كلمة المرور الجامعية</label>
          <input type="password" id="newUniPasswordInput" class="modal-input" placeholder="••••••••" required autocomplete="off">
        </div>
  
        <div class="upload-modal-actions">
          <button type="submit" class="btn-submit-upload">حفظ التغييرات</button>
          <button type="button" class="btn-cancel-upload" onclick="closeUniPasswordModal()">إلغاء</button>
        </div>
      </form>
    </div>
  </div>
  
  

  <!-- Firebase Compatibility SDKs -->
    
  

  <!-- SUCCESS TOAST NOTIFICATION -->
  <div id="toastNotification" class="toast-notification">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span id="toastMessage">تمت العملية بنجاح!</span>
  </div>
  
  <!-- ERROR TOAST NOTIFICATION -->
  <div id="errorToastNotification" class="toast-notification toast-error">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
    <span id="errorToastMessage">حدث خطأ في المدخلات!</span>
  </div>

` }} />
      <Script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js" strategy="afterInteractive" />
      <Script src="/profile-script.js" strategy="afterInteractive" onReady={() => { if (typeof (window as any).checkUserSession === 'function') { (window as any).checkUserSession(); } if (typeof (window as any).initSidebarEvents === 'function') { (window as any).initSidebarEvents(); } }} />
      <Footer />
    </div>
  );
}
