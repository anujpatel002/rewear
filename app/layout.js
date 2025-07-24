'use client';
import './globals.css';
import { SessionProvider, useSession } from '@/context/SessionContext';
import Header from '../Components/Header/page';
import AdminHeader from '../Components/AdminHeader/page';
import { Geist, Geist_Mono } from 'next/font/google';


const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

function DynamicHeader() {
  const { user } = useSession();
  if (user?.email === 'admin@gmail.com') {
    return <AdminHeader />;
  }
  return <Header />;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-100 min-h-screen`}>
        <SessionProvider>
          <DynamicHeader />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
