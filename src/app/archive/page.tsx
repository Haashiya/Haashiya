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
      <link rel="stylesheet" href="/dashboard.css" />\n      <link rel="stylesheet" href="/archive.css" />
      <div dangerouslySetInnerHTML={{ __html: `
  

  <!-- SIDEBAR OVERLAY -->
  

  <!-- SIDEBAR CONTAINER -->
  

  <!-- HERO BANNER -->
  <section class="hero-banner">
    <div class="hero-overlay archive-hero-overlay">
      <div class="hero-content">
        <h1 class="hero-title"><span class="title-white">معرض</span> <span class="title-dark">الأرشيف</span></h1>
        <p class="hero-subtitle">منطقة حصرية للأعضاء لتسهيل الوصول إلى تسجيلات المحاضرات، والملاحظات المكتوبة على السابورة، وأرشيف الواجبات، والصور الأخرى.</p>
      </div>
    </div>
  </section>

  <main class="library-wrapper">
    <!-- 1. RECORDINGS SECTION -->
    <section id="recordings" class="main-card-section">
      <div class="section-header">
        <h2 class="section-title">التسجيلات</h2>
        <a href="#" class="view-all-link">&rarr; عرض الكل</a>
      </div>

      <div class="archive-filter-bar">
        <select class="level-select">
          <option value="1">المستوى الأول</option>
          <option value="2">المستوى الثاني</option>
        </select>
        <div class="category-buttons" style="margin-bottom: 0;">
          <button class="cat-btn active" onclick="switchSubject('recordings', 'balagha', this)">البلاغة</button>
          <button class="cat-btn" onclick="switchSubject('recordings', 'qiraah', this)">القراءة</button>
          <button class="cat-btn" onclick="switchSubject('recordings', 'tawheed', this)">التوحيد</button>
          <button class="cat-btn" onclick="switchSubject('recordings', 'kitaba', this)">الكتابة</button>
          <button class="cat-btn" onclick="switchSubject('recordings', 'nahw', this)">النحو</button>
          <button class="cat-btn" onclick="switchSubject('recordings', 'adab', this)">تاريخ الأدب</button>
          <button class="cat-btn" onclick="switchSubject('recordings', 'indonesian', this)">اللغة الإندونيسية</button>
          <button class="cat-btn" onclick="switchSubject('recordings', 'pkn', this)">التربية الوطنية</button>
        </div>
        
      </div>

      <!-- Dynamic YouTube Grid Container -->
      <div id="recordingsContainer" class="recordings-grid"></div>
    </section>

    <!-- 2. ASSIGNMENTS SECTION -->
    <section id="assignments" class="main-card-section">
      <div class="section-header">
        <h2 class="section-title">الواجبات</h2>
        <a href="#" class="view-all-link">&rarr; عرض الكل</a>
      </div>

      <div class="archive-filter-bar">
        <select class="level-select">
          <option value="1">المستوى الأول</option>
          <option value="2">المستوى الثاني</option>
        </select>
        <div class="category-buttons" style="margin-bottom: 0;">
          <button class="cat-btn active" onclick="switchSubject('assignments', 'balagha', this)">البلاغة</button>
          <button class="cat-btn" onclick="switchSubject('assignments', 'qiraah', this)">القراءة</button>
          <button class="cat-btn" onclick="switchSubject('assignments', 'tawheed', this)">التوحيد</button>
          <button class="cat-btn" onclick="switchSubject('assignments', 'kitaba', this)">الكتابة</button>
          <button class="cat-btn" onclick="switchSubject('assignments', 'nahw', this)">النحو</button>
          <button class="cat-btn" onclick="switchSubject('assignments', 'adab', this)">تاريخ الأدب</button>
          <button class="cat-btn" onclick="switchSubject('assignments', 'indonesian', this)">اللغة الإندونيسية</button>
          <button class="cat-btn" onclick="switchSubject('assignments', 'pkn', this)">التربية الوطنية</button>
        </div>
        
      </div>

      <div id="assignmentsContainer" class="book-list-container"></div>
    </section>

    <!-- 3. WHITEBOARDS SECTION -->
    <section id="whiteboards" class="main-card-section">
      <div class="section-header">
        <h2 class="section-title">السبورات</h2>
        <a href="#" class="view-all-link">&rarr; عرض الكل</a>
      </div>

      <div class="archive-filter-bar">
        <select class="level-select">
          <option value="1">المستوى الأول</option>
          <option value="2">المستوى الثاني</option>
        </select>
        <div class="category-buttons" style="margin-bottom: 0;">
          <button class="cat-btn active" onclick="switchSubject('whiteboards', 'balagha', this)">البلاغة</button>
          <button class="cat-btn" onclick="switchSubject('whiteboards', 'qiraah', this)">القراءة</button>
          <button class="cat-btn" onclick="switchSubject('whiteboards', 'tawheed', this)">التوحيد</button>
          <button class="cat-btn" onclick="switchSubject('whiteboards', 'kitaba', this)">الكتابة</button>
          <button class="cat-btn" onclick="switchSubject('whiteboards', 'nahw', this)">النحو</button>
          <button class="cat-btn" onclick="switchSubject('whiteboards', 'adab', this)">تاريخ الأدب</button>
          <button class="cat-btn" onclick="switchSubject('whiteboards', 'indonesian', this)">اللغة الإندونيسية</button>
          <button class="cat-btn" onclick="switchSubject('whiteboards', 'pkn', this)">التربية الوطنية</button>
        </div>
        
      </div>

      <div id="whiteboardsContainer" class="gallery-grid"></div>
    </section>

    <!-- 4. OTHER PHOTOS SECTION -->
    <section id="photos" class="main-card-section">
      <div class="section-header">
        <h2 class="section-title">الصور الأخرى</h2>
        <a href="#" class="view-all-link">&rarr; عرض الكل</a>
      </div>

      <div class="archive-filter-bar">
        <select class="level-select">
          <option value="1">المستوى الأول</option>
          <option value="2">المستوى الثاني</option>
        </select>
        <div class="category-buttons" style="margin-bottom: 0;">
          <button class="cat-btn active" onclick="switchSubject('photos', 'balagha', this)">البلاغة</button>
          <button class="cat-btn" onclick="switchSubject('photos', 'qiraah', this)">القراءة</button>
          <button class="cat-btn" onclick="switchSubject('photos', 'tawheed', this)">التوحيد</button>
          <button class="cat-btn" onclick="switchSubject('photos', 'kitaba', this)">الكتابة</button>
          <button class="cat-btn" onclick="switchSubject('photos', 'nahw', this)">النحو</button>
          <button class="cat-btn" onclick="switchSubject('photos', 'adab', this)">تاريخ الأدب</button>
          <button class="cat-btn" onclick="switchSubject('photos', 'indonesian', this)">اللغة الإندونيسية</button>
          <button class="cat-btn" onclick="switchSubject('photos', 'pkn', this)">التربية الوطنية</button>
        </div>
        
      </div>

      <div id="photosContainer" class="gallery-grid"></div>
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

  <!-- YOUTUBE VIDEO PLAYER MODAL -->
  <div id="videoPlayerModal" class="upload-modal-overlay" onclick="handleModalBackdropClick(event)">
    <div class="upload-modal-card video-modal-card" style="max-width: 800px; width: 90%;">
      <button class="modal-close-x" onclick="closeVideoModal()">&times;</button>
      <h3 id="modalVideoTitle" class="upload-modal-title" style="margin-bottom: 16px;">مشاهدة التسجيل</h3>
      <div class="iframe-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px;">
        <iframe 
          id="youtubeIframe" 
          src="" 
          style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
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
      <div id="notificationsList" class="notifications-list-container"></div>
    </div>
  </div>

  
` }} />
      <Script 
        src="/archive-script.js" 
        strategy="lazyOnload" 
        onReady={() => {
          if (typeof window !== 'undefined' && (window as any).initArchivePage) {
            (window as any).initArchivePage();
          }
        }}
      />
      <Footer />
    </div>
  );
}
