"use client";
import React from 'react';

export default function HomeTab() {
  return (
    <section className="tab-section active">
      <span className="tab-header-badge">لوحة الإحصائيات العامة</span>
      <div className="tab-card-body">
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          مرحباً بك في لوحة تحكم المشرفين. استخدم الأيقونات أعلاه لإدارة المواد التعليمية، والموافقة على الكتب المرفوعة، والاطلاع على قاعدة بيانات الطلاب.
        </p>
      </div>
    </section>
  );
}
