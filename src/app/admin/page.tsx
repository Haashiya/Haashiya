"use client";
import React from 'react';
import '@/styles/dashboard.css';
import '@/styles/admin.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminDashboard from './_components/AdminDashboard';

export default function Page() {
  return (
    <div className="mobile-container">
      <Navbar />
      <AdminDashboard />
      <Footer />
    </div>
  );
}
