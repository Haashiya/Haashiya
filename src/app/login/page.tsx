"use client";
import React, { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Jika sudah login tapi ter-back ke /login, langsung pantulkan ke Beranda (/)
    if (localStorage.getItem('currentUser')) {
      router.push('/');
    }
  }, [router]);

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

    <a href="/" class="back-home-link" onclick="smoothNavigate(event, '/')">
      &rarr; العودة للرئيسية
    </a>
  </div>

  

` }} />
      <Script src="/login-script.js" strategy="lazyOnload" />
    </>
  );
}
