import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { AuthProvider } from '../hooks/useAuth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Telegram Rewards Platform',
  description: 'Gamified rewards platform inside Telegram Mini Apps',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Load Telegram WebApp JS SDK before page becomes interactive */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-[#0a0815] via-[#0f0c23] to-[#080711] text-slate-100 antialiased flex flex-col justify-start items-center">
        {/* Mobile viewport wrapper constrained to ~390px-430px */}
        <div className="w-full max-w-[430px] min-h-screen flex flex-col relative px-2 shadow-2xl">
          <AuthProvider>
            <main className="flex-1 flex flex-col justify-center w-full py-4">
              {children}
            </main>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
