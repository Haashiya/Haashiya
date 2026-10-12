"use client";
import React, { useEffect } from 'react';
import '@/styles/style.css';
import { useRouter } from 'next/navigation';
import LoginForm from './_components/LoginForm';

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
      <LoginForm />
    </>
  );
}
