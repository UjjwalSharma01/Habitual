import { NextResponse } from 'next/server';

export function middleware(request) {
  // This is a simplified middleware
  // In a real implementation, you would validate tokens server-side
  // For now, we'll rely on client-side auth checks
  
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/offline'
  ];
  
  // PWA resources that don't require authentication
  const pwaResources = [
    '/manifest.json',
    '/sw.js',
    '/workbox-',
    '/icons/',
    '/fallback/'
  ];
  
  // Check if the path is public or a PWA resource
  const isPublicPath = publicPaths.some(publicPath => path === publicPath);
  const isPWAResource = pwaResources.some(resource => path.startsWith(resource));
  
  // Always allow PWA resources
  if (isPWAResource) {
    // Add cache control headers for PWA assets
    const response = NextResponse.next();
    if (path === '/sw.js') {
      // Don't cache service worker
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    } else if (path.startsWith('/workbox-')) {
      // Cache Workbox scripts for 1 day
      response.headers.set('Cache-Control', 'public, max-age=86400');
    } else if (path === '/manifest.json') {
      // Cache manifest for 1 hour
      response.headers.set('Cache-Control', 'public, max-age=3600');
    }
    return response;
  }
  
  // For now, allow all paths and let client-side auth handle redirects
  return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
