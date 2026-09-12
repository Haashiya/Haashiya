import type { Metadata, Viewport } from "next";
import { Work_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-primary" });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ 
  weight: ['400', '600', '700'],
  subsets: ["arabic"], 
  variable: "--font-arabic" 
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "حاشية (Haashiya) - بوابتنا لتعلم اللغة العربية",
  description: "بوابتنا لتعلم اللغة العربية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${workSans.variable} ${ibmPlexSansArabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
