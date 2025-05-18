'use client'

import { NextResponse } from 'next/server';

/**
 * This is a placeholder API route. Push notification functionality has been removed.
 * @see /docs/notifications-removed.md for more information.
 */
export async function POST() {
  return NextResponse.json(
    { 
      success: false,
      message: 'Push notification functionality has been disabled'
    },
    { status: 404 }
  );
}

// Helper function to get platform information
function getPlatformInfo() {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let platform = 'unknown';
  
  if (/Windows/.test(userAgent)) platform = 'windows';
  else if (/Android/.test(userAgent)) platform = 'android';
  else if (/iPhone|iPad|iPod/.test(userAgent)) platform = 'ios';
  else if (/Mac/.test(userAgent)) platform = 'mac';
  else if (/Linux/.test(userAgent)) platform = 'linux';
  
  return {
    type: platform,
    userAgent: userAgent
  };
}
