'use client'

import { NextResponse } from 'next/server';

/**
 * This is a placeholder API route. Push notification functionality has been removed.
 * @see /docs/notifications-removed.md for more information.
 */
export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      message: 'Push notification functionality has been disabled'
    },
    { status: 404 }
  );
}
