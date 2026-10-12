"use client";
import React, { useEffect } from 'react';
import '@/styles/dashboard.css';
import '@/styles/profile.css';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProfileDashboard from './_components/ProfileDashboard';

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
      <ProfileDashboard />
      <Script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js" strategy="afterInteractive" />
      <Footer />
    </div>
  );
}
