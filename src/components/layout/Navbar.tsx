"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(true);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false); // Default tertutup atau terbuka, saya set false agar rapi

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
          <a 
            href="#" 
            style={{
              textDecoration: 'none',
              color: '#000000', // Warna hitam (sama seperti menu di bawahnya saat belum dipencet)
              fontSize: '17px',
              fontFamily: 'var(--font-arabic)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              marginBottom: '3px' // Tambahan 3px khusus jarak ke murod (total 11px)
            }}
          >
            الرئيسية
          </a>

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
          <a 
            href="#" 
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
          </a>
          
          <a 
            href="#" 
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
          </a>
          
          <a 
            href="#" 
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
          </a>

        </div>
      </div>
    </>
  );
}
