"use client";
import React, { useState, useEffect } from 'react';
import HomeTab from './HomeTab';
import UploadTab from './UploadTab';
import ApprovalTab from './ApprovalTab';
import DatabaseTab from './DatabaseTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('homeTab');
  const [userRole, setUserRole] = useState('student');
  const [userName, setUserName] = useState('اسم المستخدم');

  useEffect(() => {
    const sessionData = localStorage.getItem('currentUser');
    if (!sessionData) {
      window.location.href = '/login';
      return;
    }

    const user = JSON.parse(sessionData);
    setUserRole(user.role || (user.isAdmin ? 'admin' : 'student'));
    setUserName(user.name || user.username);
  }, []);

  const getBadgeText = () => {
    if (userRole === 'superadmin') return 'مشرف عام';
    if (userRole === 'admin') return 'مشرف';
    return 'طالب';
  };

  return (
    <main className="admin-wrapper">
      {/* WELCOME HERO BANNER */}
      <section className="admin-hero">
        <h1 className="admin-hero-title">أهلاً وسهلاً!</h1>
        <div className="admin-hero-meta">
          <span className="admin-badge">{getBadgeText()}</span>
          <span className="admin-display-name">{userName}</span>
        </div>
      </section>

      {/* 4-TAB NAVIGATION GRID */}
      <nav className="admin-nav-grid">
        <button className={`admin-tab-btn ${activeTab === 'homeTab' ? 'active' : ''}`} onClick={() => setActiveTab('homeTab')} title="الرئيسية">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>

        <button className={`admin-tab-btn ${activeTab === 'uploadTab' ? 'active' : ''}`} onClick={() => setActiveTab('uploadTab')} title="الرفع">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>

        <button className={`admin-tab-btn ${activeTab === 'approvalTab' ? 'active' : ''}`} onClick={() => setActiveTab('approvalTab')} title="الموافقات">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        </button>

        <button className={`admin-tab-btn ${activeTab === 'databaseTab' ? 'active' : ''}`} onClick={() => setActiveTab('databaseTab')} title="قاعدة البيانات">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M21 19c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14"></path>
            <path d="M21 5v14"></path>
          </svg>
        </button>
      </nav>

      {/* TABS CONTENT */}
      {activeTab === 'homeTab' && <HomeTab />}
      {activeTab === 'uploadTab' && <UploadTab />}
      {activeTab === 'approvalTab' && <ApprovalTab />}
      {activeTab === 'databaseTab' && <DatabaseTab userRole={userRole} />}
    </main>
  );
}
