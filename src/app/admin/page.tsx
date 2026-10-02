"use client";
import React from 'react';
import Script from 'next/script';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Page() {
  return (
    <div className="mobile-container">
      <Navbar />
      <link rel="stylesheet" href="/dashboard.css" />\n      <link rel="stylesheet" href="/admin.css" />
      <div dangerouslySetInnerHTML={{ __html: `

  

  <main class="admin-wrapper">
    
    <!-- WELCOME HERO BANNER -->
    <section class="admin-hero">
      <h1 class="admin-hero-title">أهلاً وسهلاً!</h1>
      <div class="admin-hero-meta">
        <span class="admin-badge" id="adminBadge">مشرف</span>
        <span class="admin-display-name" id="adminDisplayName">اسم المستخدم</span>
      </div>
    </section>

    <!-- 4-TAB NAVIGATION GRID -->
    <nav class="admin-nav-grid">
      <button class="admin-tab-btn active" onclick="switchAdminTab('homeTab', this)" title="الرئيسية">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </button>

      <button class="admin-tab-btn" onclick="switchAdminTab('uploadTab', this)" title="الرفع">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </button>

      <button class="admin-tab-btn" onclick="switchAdminTab('approvalTab', this)" title="الموافقات">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
      </button>

      <button class="admin-tab-btn" onclick="switchAdminTab('databaseTab', this)" title="قاعدة البيانات">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M21 19c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14"></path>
          <path d="M21 5v14"></path>
        </svg>
      </button>
    </nav>

    <!-- TAB 1: HOME SECTION -->
    <section id="homeTab" class="tab-section active">
      <span class="tab-header-badge">لوحة الإحصائيات العامة</span>
      <div class="tab-card-body">
        <p style="color: #64748b; font-size: 0.95rem;">مرحباً بك في لوحة تحكم المشرفين. استخدم الأيقونات أعلاه لإدارة المواد التعليمية، والموافقة على الكتب المرفوعة، والاطلاع على قاعدة بيانات الطلاب.</p>
      </div>
    </section>

    <!-- TAB 2: UPLOAD SECTION -->
    <section id="uploadTab" class="tab-section">
      <div class="admin-section-actions">
        <span class="tab-header-badge">المواد التعليمية</span>
        <button class="btn-add-book" onclick="openBookModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          إضافة كتاب جديد
        </button>
      </div>
    
      <div class="tab-card-body">
        <div id="adminBooksContainer" class="admin-book-list">
          <p style="text-align: center; color: #94a3b8; padding: 20px 0;">جاري تحميل الكتب...</p>
        </div>
      </div>
    </section>

    <!-- TAB 3: APPROVAL SECTION -->
    <section id="approvalTab" class="tab-section">
      <span class="tab-header-badge">طلبات المكتبة العامة</span>
      <div class="tab-card-body">
        <div id="pendingApprovalsList">
          <p style="text-align: center; color: #94a3b8;">لا توجد طلبات معلقة حالياً</p>
        </div>
      </div>
    </section>

   <!-- TAB 4: DATABASE SECTION -->
<section id="databaseTab" class="tab-section">
    <!-- MALE / FEMALE TAB SWITCHER -->
    <div class="gender-db-tabs">
      <button type="button" class="gender-tab-btn male-tab active" onclick="switchGenderDatabase('male', this)">
        <span>قاعدة بيانات الطلاب</span>
        <svg class="gender-tab-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="10" cy="14" r="5"></circle>
          <path d="M19 5L13.5 10.5"></path>
          <path d="M19 5h-5"></path>
          <path d="M19 5v5"></path>
        </svg>
      </button>
  
      <button type="button" class="gender-tab-btn female-tab" onclick="switchGenderDatabase('female', this)">
        <span>قاعدة بيانات الطالبات</span>
        <svg class="gender-tab-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="10" r="5"></circle>
          <path d="M12 15v7"></path>
          <path d="M9 19h6"></path>
        </svg>
      </button>
    </div>
  
    <div class="tab-card-body">
      <!-- SEARCH BAR -->
      <div class="database-card-header">
        <div class="fancy-search-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            id="studentSearchInput" 
            class="fancy-search-input" 
            placeholder="بحث باسم الطالب أو اسم المستخدم..." 
            oninput="handleSearchInput(this)"
          >
          <button type="button" id="clearSearchBtn" class="clear-search-btn" onclick="clearStudentSearch()" aria-label="مسح البحث">&times;</button>
        </div>
      </div>
  
      <!-- CLEAN STUDENT LIST CONTAINER -->
      <div id="studentListContainer" class="student-list-container">
        <!-- Dynamic student rows rendered here -->
      </div>
    </div>
  </section>
  
  <!-- STUDENT FULL PROFILE MODAL (Styled like profile.html) -->
  <div id="studentProfileModal" class="admin-modal-overlay">
    <div class="admin-modal-card profile-preview-card">
      <button class="modal-close-x" onclick="closeStudentProfileModal()">&times;</button>
      
      <div class="profile-preview-header">
        <img id="modalUserAvatar" src="assets/images/web/default_avatar.png" alt="Avatar" class="profile-preview-avatar">
        <span class="profile-label-top">الاسم المعروض</span>
        <h2 id="modalDisplayName" class="profile-user-title">اسم الطالب</h2>
        <div id="modalGenderBadgeContainer" class="gender-badge-container"></div>
      </div>
  
      <hr class="profile-divider">
  
      <div class="profile-details-list">
        <div class="detail-row">
          <span class="detail-value" id="modalStudentId">11011110001</span>
          <span class="detail-label">الرقم الجامعي</span>
        </div>
        <div class="detail-row">
          <span class="detail-value" id="modalEmail">example@domain.com</span>
          <span class="detail-label">البريد الإلكتروني</span>
        </div>
        <div class="detail-row">
          <span class="detail-value" id="modalUsername">username</span>
          <span class="detail-label">اسم المستخدم</span>
        </div>
      </div>
    </div>
  </div>
  
  
  </main>

  <!-- ADD / EDIT BOOK MODAL -->
  <div id="bookModal" class="admin-modal-overlay">
    <div class="admin-modal-card">
      <button class="modal-close-x" onclick="closeBookModal()" style="position: absolute; left: 16px; top: 16px; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
      <h3 id="modalTitle" style="margin: 0 0 16px 0; color: #0f172a;">إضافة كتاب جديد</h3>
      
      <form id="bookForm" onsubmit="handleSaveBook(event)">
        <input type="hidden" id="bookIdInput">
        
        <div class="admin-form-group">
          <label>عنوان الكتاب</label>
          <input type="text" id="bookTitleInput" class="admin-input" placeholder="مثال: البديع في ضوء أساليب القرآن" required>
        </div>
  
        <div class="admin-form-group">
          <label>المؤلف / الدكتور</label>
          <input type="text" id="bookAuthorInput" class="admin-input" placeholder="مثال: د. عبد الفتاح لاشين" required>
        </div>
  
        <div class="admin-form-group">
          <label>المادة / المقرر</label>
          <select id="bookCategorySelect" class="admin-select">
            <option value="balagha">البلاغة</option>
            <option value="qiraah">القراءة</option>
            <option value="tawheed">التوحيد</option>
            <option value="kitaba">الكتابة</option>
            <option value="nahw">النحو</option>
            <option value="adab">تاريخ الأدب</option>
            <option value="indonesian">اللغة الإندونيسية</option>
          </select>
        </div>
  
        <div class="admin-form-group">
          <label>رابط غلاف الكتاب (Cover Image URL)</label>
          <input type="url" id="bookCoverInput" class="admin-input" placeholder="https://..." required>
        </div>
  
        <div class="admin-form-group">
          <label>رابط ملف الـ PDF</label>
          <input type="url" id="bookPdfInput" class="admin-input" placeholder="https://..." required>
        </div>
  
        <button type="submit" class="admin-btn-submit" style="margin-top: 10px;">حفظ الكتاب</button>
      </form>
    </div>
  </div>

    
  
` }} />
      <Script src="/admin-script.js" strategy="lazyOnload" />
      <Footer />
    </div>
  );
}
