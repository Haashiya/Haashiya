"use client";
import React, { useEffect } from 'react';
import '@/styles/dashboard.css';
import '@/styles/archive.css';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ArchiveHero from './_components/ArchiveHero';
import RecordingsSection from './_components/RecordingsSection';
import AssignmentsSection from './_components/AssignmentsSection';
import GallerySection from './_components/GallerySection';

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
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseSkeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton-box {
          background-color: #cbd5e1;
          border-radius: 4px;
          animation: pulseSkeleton 1.5s ease-in-out infinite;
        }
      `}} />

      <ArchiveHero />

      <main className="library-wrapper">
        <RecordingsSection />
        <AssignmentsSection />
        <GallerySection type="whiteboards" title="الملاحظات (السبورة)" />
        <GallerySection type="photos" title="الصور الأخرى" />
      </main>

      <Footer />
    </div>
  );
}
