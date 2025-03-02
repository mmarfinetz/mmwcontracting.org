// API route to fetch Google Reviews (server-side)
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Your Google API Key and Place ID - should be stored in environment variables
    // in a real production application
    const API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY';
    const PLACE_ID = process.env.PLACE_ID || 'YOUR_PLACE_ID';
    
    // Make secure server-side request to Google Place API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,review,formatted_phone_number,url&key=${API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Google API');
    }
    
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}