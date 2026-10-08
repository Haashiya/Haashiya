"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Buka dropdown sesuai dengan halaman saat ini
  const [isArchiveOpen, setIsArchiveOpen] = useState(pathname === '/archive');
  const [isLibraryOpen, setIsLibraryOpen] = useState(pathname === '/materials'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<{name: string, role: string, avatar: string, gender?: string} | null>(null);

  // Jika pindah halaman lewat router tanpa full reload, pastikan sidebar menyesuaikan otomatis
  useEffect(() => {
    if (pathname === '/archive') {
      setIsArchiveOpen(true);
      setIsLibraryOpen(false);
    } else if (pathname === '/materials') {
      setIsArchiveOpen(false);
      setIsLibraryOpen(true);
    } else {
      setIsArchiveOpen(false);
      setIsLibraryOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserData(parsed);
        setIsLoggedIn(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <>
      <nav style={{
        height: '72px',
        backgroundColor: 'var(--color-surface)',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', transform: 'translateY(2px)' }}>
          <Link href="/">
            <Image
              src="/images/navbar_logo.png"
              alt="حاشية (Haashiya)"
              width={70}
              height={8}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isLoggedIn ? (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: 'rgba(56, 58, 58, 1)',
                color: 'var(--color-white-text)',
                borderRadius: '5px',
                padding: '6px 16px 10px 16px',
                fontFamily: 'var(--font-base)',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: 1,
                cursor: 'pointer',
                border: 'none'
              }}>
                تسجيل الدخول
              </button>
            </Link>
          ) : (
            <div style={{ position: 'relative' }} dir="rtl">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#E5E9EC',
                  padding: '6px 6px 6px 12px',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-arabic)',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#1E3A8A',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: 'var(--font-base)',
                  overflow: 'hidden'
                }}>
                  {userData?.avatar && !userData.avatar.includes('default_avatar') ? (
                    <img src={userData.avatar.startsWith('/') ? userData.avatar : `/${userData.avatar}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img 
                      src={userData?.gender === 'female' 
                        ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jane&backgroundColor=ffdfbf' 
                        : 'https://api.dicebear.com/9.x/avataaars/svg?seed=John&backgroundColor=b6e3f4'} 
                      alt="Avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  )}
                </div>

                {/* Name */}
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                  {userData?.name || 'alip'}
                </span>

                {/* Role Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#BFDBFE',
                  color: '#1E3A8A',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '2px'
                }}>
                  <span>
                    {userData?.role === 'superadmin' ? 'مسؤول عام' : 
                     userData?.role === 'admin' ? 'مسؤول' : 'طالب'}
                  </span>
                  {userData?.gender === 'female' ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="9" r="6"></circle>
                      <line x1="12" y1="15" x2="12" y2="22"></line>
                      <line x1="9" y1="19" x2="15" y2="19"></line>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="14" r="7"></circle>
                      <line x1="21" y1="3" x2="15" y2="9"></line>
                      <polyline points="16 3 21 3 21 8"></polyline>
                    </svg>
                  )}
                </div>

                {/* Caret */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: '2px' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  width: '220px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50
                }}>
                  <Link href="/profile" onClick={() => setIsProfileOpen(false)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    textDecoration: 'none',
                    color: '#374151',
                    fontSize: '15px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-arabic)',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span style={{ marginTop: '2px' }}>الملف الشخصي</span>
                  </Link>

                  <button onClick={() => {
                    setIsProfileOpen(false);
                    if (typeof window !== 'undefined' && (window as any).openNotificationsModal) {
                      (window as any).openNotificationsModal();
                    }
                  }} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontSize: '15px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-arabic)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'right'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span style={{ marginTop: '2px' }}>الإشعارات</span>
                  </button>
                  
                  <div style={{ height: '1px', backgroundColor: '#D1D5DB', margin: '4px 0' }}></div>

                  <button onClick={() => {
                    localStorage.removeItem('currentUser'); localStorage.removeItem('authToken');
                    setIsLoggedIn(false);
                    setIsProfileOpen(false);
                    setUserData(null);
                    window.location.href = '/login';
                  }} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontSize: '15px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-arabic)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'right',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span style={{ marginTop: '2px' }}>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Menu icon button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="القائمة"
            style={{
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              border: '1.5px solid var(--color-primary-600)',
              backgroundColor: 'transparent',
              color: 'var(--color-primary-600)',
              padding: 0
            }}
          >
            <svg width="22" height="22" viewBox="0 0 16 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              {/* Titik Atas */}
              <path d="M8 1L11.5 4.5L8 8L4.5 4.5Z" />
              {/* Titik Tengah (digeser ke bawah 1px) */}
              <path d="M8 4.5L11.5 8L8 11.5L4.5 8Z" transform="translate(0, 2)" />
              {/* Titik Bawah (digeser ke bawah 2px) */}
              <path d="M8 8L11.5 11.5L8 15L4.5 11.5Z" transform="translate(0, 4)" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: '72px', // Mulai dari bawah navbar
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998, // di bawah sidebar tapi di atas konten lain
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Sidebar Container */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen ? 0 : '-300px', // Menggeser dari kiri
        width: '280px',
        height: '100vh',
        backgroundColor: 'var(--color-surface)',
        zIndex: 9999, // Paling atas
        transition: 'left 0.3s ease-in-out',
        boxShadow: isSidebarOpen ? '2px 0 8px rgba(0,0,0,0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: 0, // Padding dihapus dari container agar header bisa menyentuh pinggir
        direction: 'rtl'
      }}>
        {/* Header Sidebar */}
        <div style={{
          height: '72px', // Sama dengan tinggi navbar
          display: 'flex',
          justifyContent: 'flex-start', // Di RTL, flex-start berarti di kanan
          alignItems: 'center',
          paddingLeft: '20px',
          paddingRight: '28px', // Ditambah 4px lagi (total 28px) agar lebih jauh dari kanan
        }}>
          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Tutup"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex'
            }}
          >
            <Image
              src="/images/sidebar_icon.png"
              alt="Logo"
              width={42}
              height={42}
              style={{ objectFit: 'contain' }}
            />
          </button>
        </div>

        {/* --- PENGATURAN GARIS ABU-ABU --- */}
        <div style={{
          height: '1px',       // <-- Ubah angka ini untuk mengatur KETEBALAN garis
          width: '85%',         // <-- Ubah angka ini (misال '80%' atau '200px') untuk mengatur PANJANG garis
          backgroundColor: '#a0a0a3ff', // Warna garis
          margin: '0 auto 0 auto', // Jarak bawah dihapus agar bisa diatur dari padding container menu
        }} />

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px' }}>

          {/* Menu Utama: الرئيسية */}
          <Link 
            href="/" 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              textDecoration: 'none',
              color: pathname === '/' ? '#888888' : '#000000', // Abu-abu jika sedang di beranda
              fontSize: '17px',
              fontFamily: 'var(--font-arabic)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              marginBottom: '3px' // Tambahan 3px khusus jarak ke murod (total 11px)
            }}
          >
            الرئيسية
          </Link>

          {/* Menu dengan dropdown: معرض الأرشيف */}
          <div style={{ marginBottom: '2px' }}>
            <button
              onClick={() => setIsArchiveOpen(!isArchiveOpen)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: 0,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: isArchiveOpen ? '#888888' : '#000000', // Abu-abu jika terbuka, hitam jika tertutup
                fontSize: '17px', // Disamakan dengan ukuran card
                fontFamily: 'var(--font-arabic)',
                fontWeight: 600,
              }}
            >
              <span>معرض الأرشيف</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{
                  transform: isArchiveOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  marginTop: '2px'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Sub-menu */}
            {isArchiveOpen && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                paddingRight: '24px', // Indentasi 24px dari kanan
                marginTop: '16px'
              }}>
                {[
                  { title: 'التسجيلات', href: '/archive#recordings' },
                  { title: 'السبورات', href: '/archive#whiteboards' },
                  { title: 'الواجبات', href: '/archive#assignments' },
                  { title: 'الصور', href: '/archive#photos' }
                ].map((subItem, idx) => (
                  <Link
                    key={idx}
                    href={subItem.href}
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                      textDecoration: 'none',
                      color: '#003399',
                      fontSize: '17px',
                      fontFamily: 'var(--font-arabic)',
                      fontWeight: 600,
                      display: 'block'
                    }}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Menu dengan dropdown: المكتبة الرقمية */}
          <div>
            <button
              onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: 0,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: isLibraryOpen ? '#888888' : '#000000',
                fontSize: '17px',
                fontFamily: 'var(--font-arabic)',
                fontWeight: 600,
              }}
            >
              <span>المكتبة الرقمية</span>
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" 
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ 
                  transform: isLibraryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  marginTop: '2px'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Sub-menu المكتبة الرقمية */}
            {isLibraryOpen && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '18px', 
                paddingRight: '24px', 
                marginTop: '18px'
              }}>
                {[
                  { title: 'المواد التعليمية', href: '/materials#educational-materials' },
                  { title: 'المكتبة العامة', href: '/materials#general-library' }
                ].map((subItem, idx) => (
                  <Link
                    key={idx}
                    href={subItem.href}
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                      textDecoration: 'none',
                      color: '#003399',
                      fontSize: '17px',
                      fontFamily: 'var(--font-arabic)',
                      fontWeight: 600,
                      display: 'block'
                    }}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 3 Menu Tambahan Baru */}
          <Link 
            href="#coming-soon" 
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined' && (window as any).showGlobalToast) {
                (window as any).showGlobalToast('قريباً! هذه الصفحة قيد التطوير.');
              }
              setIsSidebarOpen(false);
            }}
            style={{
              textDecoration: 'none',
              color: '#000000',
              fontSize: '17px',
              fontFamily: 'var(--font-arabic)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            معجم المصطلحات
          </Link>
          
          <Link 
            href="#coming-soon" 
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined' && (window as any).showGlobalToast) {
                (window as any).showGlobalToast('قريباً! هذه الصفحة قيد التطوير.');
              }
              setIsSidebarOpen(false);
            }}
            style={{
              textDecoration: 'none',
              color: '#000000',
              fontSize: '17px',
              fontFamily: 'var(--font-arabic)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            التقويم الأكاديمي
          </Link>
          
          <Link 
            href="#coming-soon" 
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined' && (window as any).showGlobalToast) {
                (window as any).showGlobalToast('قريباً! هذه الصفحة قيد التطوير.');
              }
              setIsSidebarOpen(false);
            }}
            style={{
              textDecoration: 'none',
              color: '#000000',
              fontSize: '17px',
              fontFamily: 'var(--font-arabic)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            التعلم المدعوم بالذكاء الاصطناعي
          </Link>
        </div>
      </div>
    </>
  );
}
