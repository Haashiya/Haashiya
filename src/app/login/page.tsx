"use client";
import React from 'react';
import Script from 'next/script';

export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="/style.css" />
      <div dangerouslySetInnerHTML={{ __html: `

  <div class="login-card">
    <h2>مرحباً بك!</h2>
    <p class="subtitle">يُرجَى تسجيل الدخول باستخدام البيانات المزوَّدة لك</p>

    <form id="loginForm" onsubmit="handleLoginSubmit(event)">
      <div class="input-group">
        <label for="username">اسم المستخدم</label>
        <input type="text" id="username" placeholder="أدخل اسم المستخدم" required autocomplete="off">
      </div>

      <div class="input-group">
        <label for="password">كلمة المرور</label>
        <input type="password" id="password" placeholder="أدخل كلمة المرور" required>
      </div>

      <button type="submit" class="login-btn">تسجيل الدخول</button>
      <div id="message" class="message"></div>
    </form>

    <a href="index.html#educational-materials" class="back-home-link" onclick="smoothNavigate(event, 'index.html#educational-materials')">
      &rarr; العودة للرئيسية
    </a>
  </div>

  

` }} />
      <Script src="/login-script.js" strategy="lazyOnload" />
    </>
  );
}
