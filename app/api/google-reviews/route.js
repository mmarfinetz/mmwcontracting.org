// Google Reviews API endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This is a server-side implementation to fetch Google reviews
    // For MMW Contracting with place_id: ChIJ5SN41h5KzYkRo5dnBsiFcxM
    
    // Fetch from Google Places API
    const placeId = 'ChIJ5SN41h5KzYkRo5dnBsiFcxM'; // MMW Contracting place ID
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    // URL to fetch reviews through Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,url&key=${apiKey}`;
    
    let response;
    
    // If no API key is set, return sample data for development
    if (!apiKey) {
      console.warn("No Google Places API key found. Using sample data.");
      response = {
        result: {
          name: "MMW Contracting",
          rating: 5.0,
          url: "https://g.page/r/CaM5Z6DIV3MTEAE/review",
          reviews: [
            {
              author_name: "John Doe",
              profile_photo_url: "",
              rating: 5,
              relative_time_description: "a month ago",
              text: "Great service! Fixed my plumbing issue quickly and professionally.",
              time: Math.floor(Date.now() / 1000) - 2592000 // approx 30 days ago
            },
            {
              author_name: "Jane Smith",
              profile_photo_url: "",
              rating: 5,
              relative_time_description: "3 months ago",
              text: "MMW Contracting did an excellent job on our bathroom renovation. Highly recommend!",
              time: Math.floor(Date.now() / 1000) - 7776000 // approx 90 days ago
            },
            {
              author_name: "Bob Johnson",
              profile_photo_url: "",
              rating: 4,
              relative_time_description: "6 months ago", 
              text: "Good work at a fair price. Would use again for future projects.",
              time: Math.floor(Date.now() / 1000) - 15552000 // approx 180 days ago
            }
          ]
        }
      };
    } else {
      // Fetch real data from Google Places API
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      if (!res.ok) {
        throw new Error(`Google Places API responded with status: ${res.status}`);
      }
      response = await res.json();
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reviews', 
      message: error.message 
    }, { status: 500 });
  }
}