import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './utils/supabase/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
    return NextResponse.next();
  }

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: currentUser } = await supabase.from("user").select('*').eq('user_id', data.user.id).single();

  const adminProtectedPaths = ['/manage-recipe', '/manage-details'];

  const isPathProtected = adminProtectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if(currentUser.role_id !== 1 && isPathProtected){
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}