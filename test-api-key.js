// Test script to verify the Google Places API key works
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const placeId = 'ChIJ5SN41h5KzYkRo5dnBsiFcxM'; // MMW Contracting place ID

if (!apiKey) {
  console.error('API key not found in .env.local file');
  process.exit(1);
}

console.log('API Key found:', apiKey.substring(0, 10) + '...');

// First, try a simple Places API request (find nearby places)
const simpleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=38.9072,-77.0369&radius=1000&key=${apiKey}`;

console.log('Testing simpler Places API endpoint...');
https.get(simpleUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (response.status === 'OK') {
      console.log('✅ Basic Places API request successful!');
    } else {
      console.error('❌ Basic Places API request failed:', response.status);
      console.error('Error message:', response.error_message);
    }
    
    // Now try the detailed place request
    console.log('\nTesting detailed place request...');
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,url&key=${apiKey}`;
    
    https.get(detailUrl, (res) => {
      let detailData = '';
      
      res.on('data', (chunk) => {
        detailData += chunk;
      });
      
      res.on('end', () => {
        const detailResponse = JSON.parse(detailData);
        
        if (detailResponse.status === 'OK') {
          console.log('✅ Place Details API request successful!');
          console.log('Business name:', detailResponse.result.name);
          console.log('Rating:', detailResponse.result.rating);
          console.log('Number of reviews:', detailResponse.result.reviews ? detailResponse.result.reviews.length : 0);
        } else {
          console.error('❌ Place Details API request failed:', detailResponse.status);
          console.error('Error message:', detailResponse.error_message);
        }
      });
    }).on('error', (err) => {
      console.error('Error making details request:', err.message);
    });
  });
}).on('error', (err) => {
  console.error('Error making request:', err.message);
});