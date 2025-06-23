/**
 * Health check API for PWA offline functionality
 * Used by service worker and client for connectivity detection
 */
export async function HEAD() {
  // Return a simple 200 OK response for connection testing
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export async function GET() {
  return new Response(JSON.stringify({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
