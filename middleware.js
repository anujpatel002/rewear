import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/favicon.ico'
];

const ADMIN_PATHS = [
  '/pages/Admin', '/pages/AdminUserPannel'
];

const USER_PATHS = [
  '/pages/Dashboard', '/pages/Browse', '/pages/Item', '/pages/NewItem'
  // Add other user-only paths here
];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('session');
  const role = req.cookies.get('role'); // You must set this cookie on login

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If not logged in, redirect to login for any protected route
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If trying to access admin page but not admin, redirect to not authorized
  if (
    ADMIN_PATHS.some(path => pathname.startsWith(path)) &&
    role !== 'admin'
  ) {
    return NextResponse.redirect(new URL('/not-authorized', req.url));
  }

  // If trying to access user-only page but is admin, optionally block
  // (Uncomment if you want to restrict admins from user-only pages)
  // if (
  //   USER_PATHS.some(path => pathname.startsWith(path)) &&
  //   role === 'admin'
  // ) {
  //   return NextResponse.redirect(new URL('/not-authorized', req.url));
  // }

  // Otherwise, allow
  return NextResponse.next();
}
