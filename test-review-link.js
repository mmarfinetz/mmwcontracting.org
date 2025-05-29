// Test script to verify the Place ID from your review link
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!apiKey) {
  console.error('API key not found in .env.local file');
  process.exit(1);
}

// The ID from your review link: https://g.page/r/CaM5Z6DIV3MTEAE/review
const reviewLinkId = 'CaM5Z6DIV3MTEAE';

console.log('Testing the ID from your review link:', reviewLinkId);

// Request details and reviews for this Place ID
const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${reviewLinkId}&fields=name,formatted_address,rating,reviews,url&key=${apiKey}`;

https.get(detailsUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (response.status === 'OK') {
      console.log('\n✅ Place Details API request successful!');
      console.log('Business name:', response.result.name);
      console.log('Address:', response.result.formatted_address);
      console.log('Google Maps URL:', response.result.url);
      
      if (response.result.rating) {
        console.log('Rating:', response.result.rating);
      } else {
        console.log('Rating: No rating available');
      }
      
      if (response.result.reviews && response.result.reviews.length > 0) {
        console.log('\n✅ SUCCESS! Reviews found for this Place ID!');
        console.log(`Number of reviews: ${response.result.reviews.length}`);
        
        response.result.reviews.forEach((review, index) => {
          console.log(`\nReview #${index + 1}:`);
          console.log(`Author: ${review.author_name}`);
          console.log(`Rating: ${review.rating}/5`);
          console.log(`Text: ${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}`);
        });
        
        console.log('\n========== RECOMMENDATION ==========');
        console.log(`This Place ID "${reviewLinkId}" is valid and contains reviews.`);
        console.log('Update your app/api/google-reviews/route.js file to use this Place ID instead of sample data.');
        console.log('\nSample code for app/api/google-reviews/route.js:');
        console.log('```javascript');
        console.log('export async function GET() {');
        console.log('  try {');
        console.log('    // Use the Google Places API to fetch real reviews');
        console.log(`    const placeId = '${reviewLinkId}';`);
        console.log('    const apiKey = process.env.GOOGLE_PLACES_API_KEY;');
        console.log('    ');
        console.log('    const response = await fetch(');
        console.log(`      \`https://maps.googleapis.com/maps/api/place/details/json?place_id=\${placeId}&fields=name,rating,reviews,formatted_address,url&key=\${apiKey}\``);
        console.log('    );');
        console.log('    ');
        console.log('    const data = await response.json();');
        console.log('    return NextResponse.json(data);');
        console.log('  } catch (error) {');
        console.log('    console.error(\'Error fetching Google reviews:\', error);');
        console.log('    return NextResponse.json({ ');
        console.log('      error: \'Failed to fetch reviews\',');
        console.log('      message: error.message');
        console.log('    }, { status: 500 });');
        console.log('  }');
        console.log('}');
        console.log('```');
        console.log('====================================');
      } else {
        console.log('\n⚠️ No reviews found for this Place ID.');
        console.log('This could be because:');
        console.log('1. Your business may not have any reviews yet');
        console.log('2. Your business listing may not be fully verified on Google');
        console.log('3. The API may be restricted from accessing your reviews');
        
        console.log('\nRECOMMENDATION:');
        console.log('1. Verify if you can see reviews when you go to your Google Business Profile directly.');
        console.log('2. Check if your Google API key has the proper permissions and billing enabled.');
        console.log('3. You might need to contact Google Support for assistance with the Places API and your business listing.');
      }
    } else {
      console.error('\n❌ Place Details API request failed:', response.status);
      console.error('Error message:', response.error_message || 'None provided');
      
      console.log('\nThis suggests that the ID from your review link is not a valid Place ID for the Places API.');
      console.log('RECOMMENDATION:');
      console.log('1. Log into your Google Business Profile dashboard');
      console.log('2. Look for the actual Place ID listed in your profile settings or info page');
      console.log('3. Alternatively, use the ID from the URL when viewing your business on Google Maps');
    }
  });
}).on('error', (err) => {
  console.error('Error making details request:', err.message);
}); 