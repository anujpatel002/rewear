import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = request.cookies.get('session');
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(session.value || session); // In some envs, it's .value
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ user: null });
  }
}
