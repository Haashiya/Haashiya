"use client";
import React from 'react';
import Script from 'next/script';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Page() {
  return (
    <div className="mobile-container">
      <Navbar />
      <link rel="stylesheet" href="/dashboard.css" />
      <div dangerouslySetInnerHTML={{ __html: `
  
  

   

   

  <!-- Hero Banner Section -->
  <section class="hero-banner">
    <div class="hero-overlay">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-white">المكتبة</span>
          <span class="title-dark">الرقمية</span>
        </h1>
        <p class="hero-subtitle">رف كتب رقمي يضم مجموعة من المراجع المساندة الداعمة للدراسة الجامعية</p>

        <!-- Search Bar Inside Hero -->
        <div class="search-container">
          <input
            type="text"
            id="searchInput"
            placeholder="اكتب للبحث عن كتاب..."
            onkeyup="filterBooks()"
          />
          <button class="search-btn" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>

  <main class="library-wrapper">

    <!-- SECTION 1: المواد التعليمية -->
    <section id="educational-materials" class="main-card-section">
      <div class="section-header">
        <h2 class="section-title">المواد التعليمية</h2>
        <a href="category-view.html?cat=educational" class="view-all-link" onclick="smoothNavigate(event, 'category-view.html?cat=educational')">
          عرض الكل &rarr;
        </a>
      </div>
  
      <!-- Category Filter Tabs -->
      <div class="category-buttons">
        <button class="cat-btn active" onclick="filterCategory('balagha', this)">البلاغة</button>
        <button class="cat-btn" onclick="filterCategory('qiraah', this)">القراءة</button>
        <button class="cat-btn" onclick="filterCategory('tawheed', this)">التوحيد</button>
        <button class="cat-btn" onclick="filterCategory('kitaba', this)">الكتابة</button>
        <button class="cat-btn" onclick="filterCategory('nahw', this)">النحو</button>
        <button class="cat-btn" onclick="filterCategory('adab', this)">تاريخ الأدب</button>
        <button class="cat-btn" onclick="filterCategory('indonesian', this)">اللغة الإندونيسية</button>
      </div>
  
      <!-- Horizontal Book List Container -->
      <div id="educationalBooksContainer" class="book-list-container">
        
      </div>
    </section>
  
    <!-- SECTION 2: المكتبة العامة -->
<section id="general-library" class="main-card-section">
  <div class="section-header">
    <h2 class="section-title">المكتبة العامة</h2>
    
    <!-- Right side action buttons container -->
    <div class="section-actions">
      <!-- Sandglass Admin Button (Hidden by default, shown via JS for Admins) -->
      <button id="adminQueueBtn" class="btn-pending-queue" onclick="openAdminQueueModal()" style="display: none;" title="قائمة المراجعة">
        <img src="assets/images/web/approvalqueue_icon.png" alt="Pending Queue" class="sandglass-icon">
        <span id="pendingBadgeCount" class="pending-count">0</span>
      </button>
    
      <button class="btn-add-book" onclick="openUploadModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        طلب إضافة كتاب
      </button>
      
      <a href="category-view.html?cat=general" class="view-all-link" onclick="smoothNavigate(event, 'category-view.html?cat=general')">
        عرض الكل &rarr;</a>
    </div>
    
  </div>

  <div class="book-list-container">
    <!-- General library row items go here -->
  </div>
</section>

  
  </main>

  



  <!-- LOGOUT CONFIRMATION MODAL -->
<div id="logoutModal" class="logout-modal-overlay">
  <div class="logout-modal-card">
    <div class="logout-modal-icon">⚠️</div>
    <h3 class="logout-modal-title">تسجيل الخروج</h3>
    <p class="logout-modal-text">هل أنت تأكد من أنك تريد تسجيل الخروج؟</p>
    <div class="logout-modal-actions">
      <button class="logout-confirm-btn" onclick="confirmLogout()">نعم، تسجيل الخروج</button>
      <button class="logout-cancel-btn" onclick="closeLogoutModal()">إلغاء</button>
    </div>
  </div>
</div>

<!-- UPLOAD BOOK MODAL -->
<div id="uploadModal" class="upload-modal-overlay">
  <div class="upload-modal-card">
    <button class="modal-close-x" onclick="closeUploadModal()">&times;</button>

    <h3 class="upload-modal-title">إضافة كتاب جديد</h3>
    <p class="upload-modal-subtitle">قم برفع ملف PDF وصورة الغلاف للمساهمة في المكتبة العامة</p>

    <form id="uploadBookForm" onsubmit="handleBookSubmit(event)">
      <!-- Book Title -->
      <div class="modal-field">
        <label for="bookTitle">عنوان الكتاب</label>
        <input type="text" id="bookTitle" class="modal-input" placeholder="أدخل اسم الكتاب..." required autocomplete="off">
      </div>

      <!-- Author -->
      <div class="modal-field">
        <label for="bookAuthor">اسم المؤلف</label>
        <input type="text" id="bookAuthor" class="modal-input" placeholder="أدخل اسم المؤلف..." required autocomplete="off">
      </div>

      <!-- Theme / Topic Category -->
      <div class="modal-field">
        <label for="bookCategory">موضوع الكتاب / الفن</label>
        <select id="bookCategory" class="modal-select" required>
          <option value="العقيدة">العقيدة</option>
          <option value="الشرح">الشرح</option>
          <option value="المتن">المتن</option>
          <option value="اللغة">اللغة</option>
          <option value="الأحكام الشرعية">الأحكام الشرعية</option>
          <option value="التفسير">التفسير</option>
          <option value="الحديث">الحديث</option>
          <option value="أخرى" selected>أخرى</option>
        </select>
      </div>

      <!-- 1st Zone: PDF File -->
      <div class="drop-zone" id="pdfDropZone" onclick="document.getElementById('pdfInput').click()">
        <svg class="drop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="12" y2="12"></line>
          <line x1="15" y1="15" x2="12" y2="12"></line>
        </svg>
        <span class="drop-zone-text" id="pdfDropText">اسحب ملف PDF الكتاب هنا أو <b>اختر من الجهاز</b></span>
        <input 
          type="file" 
          id="pdfInput" 
          accept="application/pdf" 
          style="display: none;" 
          onchange="validateFileSelect(this, 'pdfDropText', ['application/pdf', '.pdf'], 'PDF')"
          >
      </div>

      <!-- 2nd Zone: Book Cover Image -->
      <div class="drop-zone" id="coverDropZone" onclick="document.getElementById('coverInput').click()">
        <svg class="drop-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span class="drop-zone-text" id="coverDropText">اسحب صورة الغلاف (PNG/JPG) أو <b>اختر صورة</b></span>
        <input 
        type="file" 
        id="coverInput" 
        accept="image/png, image/jpeg, image/jpg" 
        style="display: none;" 
        onchange="validateFileSelect(this, 'coverDropText', ['image/png', 'image/jpeg', 'image/jpg'], 'صور (PNG/JPG)')"
        >
      </div>

      <div class="upload-modal-actions">
        <button type="submit" class="btn-submit-upload">طلب رفع كتاب</button>
        <button type="button" class="btn-cancel-upload" onclick="closeUploadModal()">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- SUCCESS TOAST NOTIFICATION -->
<div id="toastNotification" class="toast-notification">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
  <span>تم طلب رفع الكتاب بنجاح! سيتم عرضه فور الموافقة عليه</span>
</div>

<!-- ERROR TOAST NOTIFICATION (SLIDES FROM RIGHT) -->
<div id="errorToastNotification" class="toast-notification toast-error">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
  <span id="errorToastMessage">حدث خطأ في المدخلات!</span>
</div>

<!-- ADMIN APPROVAL QUEUE MODAL -->
<div id="adminQueueModal" class="upload-modal-overlay">
  <div class="upload-modal-card queue-modal-card">
    <button class="modal-close-x" onclick="closeAdminQueueModal()">&times;</button>
    <h3 class="upload-modal-title">طلبات المراجعة المعلقة</h3>
    <p class="upload-modal-subtitle">الموافقة أو الرفض على الكتب المرسلة من المستخدمين</p>

    <div id="pendingBooksList" class="pending-books-container">
      <!-- Pending items populate here dynamically -->
    </div>
  </div>
</div>

<!-- EDIT BOOK MODAL -->
<div id="editBookModal" class="upload-modal-overlay">
  <div class="upload-modal-card">
    <button class="modal-close-x" onclick="closeEditBookModal()">&times;</button>

    <h3 class="upload-modal-title">تعديل معلومات الكتاب</h3>
    <p class="upload-modal-subtitle">تعديل اسم الكتاب، المؤلف، أو التصنيف</p>

    <form id="editBookForm" onsubmit="handleEditBookSubmit(event)">
      <div class="modal-field">
        <label for="editBookTitle">عنوان الكتاب</label>
        <input type="text" id="editBookTitle" class="modal-input" required autocomplete="off">
      </div>

      <div class="modal-field">
        <label for="editBookAuthor">اسم المؤلف</label>
        <input type="text" id="editBookAuthor" class="modal-input" required autocomplete="off">
      </div>

      <div class="modal-field">
        <label for="editBookCategory">موضوع الكتاب / الفن</label>
        <select id="editBookCategory" class="modal-select" required>
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

      <div class="upload-modal-actions">
        <button type="submit" class="btn-submit-upload">حفظ التغييرات</button>
        <button type="button" class="btn-cancel-upload" onclick="closeEditBookModal()">إلغاء</button>
      </div>
    </form>
  </div>
</div>

<!-- DELETE CONFIRMATION MODAL -->
<div id="deleteBookModal" class="logout-modal-overlay">
  <div class="logout-modal-card">
    <div class="logout-modal-icon">🗑️</div>
    <h3 class="logout-modal-title">حذف الكتاب</h3>
    <p class="logout-modal-text">هل أنت تأكد من رغبتك في حذف هذا الكتاب بشكل نهائي من المكتبة العامة؟</p>
    <div class="logout-modal-actions">
      <button class="logout-confirm-btn" onclick="confirmDeleteBook()">نعم، احذف الكتاب</button>
      <button class="logout-cancel-btn" onclick="closeDeleteBookModal()">إلغاء</button>
    </div>
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
    <p class="upload-modal-subtitle">سجل التحديثات وحالة طلبات إضافة الكتب</p>

    <div id="notificationsList" class="notifications-list-container">
      <!-- Dynamic notification cards render here -->
    </div>
  </div>
</div>

` }} />
      <Script src="/materials-script.js" strategy="lazyOnload" />
      <Footer />
    </div>
  );
}
