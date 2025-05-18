'use client'

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const habit = await request.json();
    
    // In a real application, you would validate and save this habit to your database
    console.log('Syncing habit:', habit);
    
    // Here you would update the habit in Firebase or your backend
    // Example: await updateHabitInFirebase(habit);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing habit:', error);
    return NextResponse.json(
      { error: 'Failed to sync habit' },
      { status: 500 }
    );
  }
}
