"use client";
import React from 'react';
import '@/styles/dashboard.css';
import Script from 'next/script';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroBanner from './_components/HeroBanner';
import EducationalMaterialsSection from './_components/EducationalMaterialsSection';
import GeneralLibrary from './_components/GeneralLibrary';
export default function MaterialsPage() {
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

      <HeroBanner />

      <main className="library-wrapper">
        <EducationalMaterialsSection />
        <GeneralLibrary />
      </main>


      <Footer />
    </div>
  );
}
