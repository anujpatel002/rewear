'use client';
import './globals.css';
import { SessionProvider, useSession } from '@/context/SessionContext';
import Header from '../Components/Header/page';
import AdminHeader from '../Components/AdminHeader/page';
import { Geist, Geist_Mono } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import { SocketProvider } from '@/context/SocketContext';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground min-h-screen`}>
        <SessionProvider>
          <SocketProvider>
            <script
              src="https://checkout.razorpay.com/v1/checkout.js"
              async
            />
            <DynamicHeader />
            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {children}
              </motion.main>
            </AnimatePresence>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
