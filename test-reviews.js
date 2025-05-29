// Test script to verify the Place ID is correctly associated with Marfinetz Plumbing
// and check if any reviews are available
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const apiKey = process.env.GOOGLE_PLACES_API_KEY;

// The address-based Place ID we found earlier
const addressPlaceId = 'ChIJdVR7OgZxMogRgvyoBwBBp8I';

// The ID from the Google Maps URL (may need conversion)
// Original URL: https://www.google.com/maps/place/Marfinetz+Plumbing/@42.0228709,-80.315449,11z/data=!3m1!4b1!4m6!3m5!1s0x60cc771ea7d823a5:0x137357c8a06739a3!8m2!3d42.0228709!4d-80.315449!16s%2Fg%2F11w8jtnvvw
// Format in URL: 0x60cc771ea7d823a5:0x137357c8a06739a3
// This needs to be converted to a Place ID format
const urlBasedId = '0x60cc771ea7d823a5:0x137357c8a06739a3';

// The review link ID from your website
const reviewLinkId = 'CaM5Z6DIV3MTEAE';

if (!apiKey) {
  console.error('API key not found in .env.local file');
  process.exit(1);
}

console.log('Testing multiple IDs to find which one has your reviews...');

// Function to test a place ID
function testPlaceId(placeId, callback) {
  console.log(`\nTesting ID: ${placeId}`);
  
  // Request details and reviews for this Place ID
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,reviews,url&key=${apiKey}`;
  
  https.get(detailsUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      
      if (response.status === 'OK') {
        console.log('✅ Place Details API request successful!');
        console.log('Business name:', response.result.name);
        console.log('Address:', response.result.formatted_address);
        console.log('Google Maps URL:', response.result.url);
        
        if (response.result.rating) {
          console.log('Rating:', response.result.rating);
        } else {
          console.log('Rating: No rating available');
        }
        
        if (response.result.reviews && response.result.reviews.length > 0) {
          console.log('✅ Reviews found!');
          console.log(`Number of reviews: ${response.result.reviews.length}`);
          
          response.result.reviews.forEach((review, index) => {
            console.log(`\nReview #${index + 1}:`);
            console.log(`Author: ${review.author_name}`);
            console.log(`Rating: ${review.rating}/5`);
            console.log(`Text: ${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}`);
          });
          
          callback(placeId, true);
        } else {
          console.log('⚠️ No reviews found for this ID.');
          callback(placeId, false);
        }
      } else {
        console.error('❌ Place Details API request failed:', response.status);
        console.error('Error message:', response.error_message || 'None provided');
        callback(placeId, false);
      }
    });
  }).on('error', (err) => {
    console.error('Error making details request:', err.message);
    callback(placeId, false);
  });
}

// Also try to find the correct Place ID using the business name and location
const searchQuery = 'Marfinetz Plumbing Lake City, PA';
const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`;

console.log('\nSearching for your business by name...');
https.get(searchUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (response.status === 'OK' && response.candidates && response.candidates.length > 0) {
      console.log('Found business by name search:');
      const nameSearchPlaceId = response.candidates[0].place_id;
      console.log('Name:', response.candidates[0].name);
      console.log('Address:', response.candidates[0].formatted_address);
      console.log('Place ID:', nameSearchPlaceId);
      
      // Start testing each ID
      testPlaceId(addressPlaceId, (id, hasReviews) => {
        if (hasReviews) {
          console.log(`\n✅ SUCCESS! The address-based Place ID (${id}) has reviews.`);
          showRecommendation(id);
        } else {
          // Try the next ID (from name search)
          testPlaceId(nameSearchPlaceId, (id, hasReviews) => {
            if (hasReviews) {
              console.log(`\n✅ SUCCESS! The name-search Place ID (${id}) has reviews.`);
              showRecommendation(id);
            } else {
              // Try the URL format ID
              // For this, we need to search by coordinates
              console.log('\nTrying to search by the coordinates from your Google Maps URL...');
              const lat = 42.0228709;
              const lng = -80.315449;
              const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=Marfinetz%20Plumbing&key=${apiKey}`;
              
              https.get(nearbySearchUrl, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                  data += chunk;
                });
                
                res.on('end', () => {
                  const response = JSON.parse(data);
                  
                  if (response.status === 'OK' && response.results && response.results.length > 0) {
                    const coordSearchPlaceId = response.results[0].place_id;
                    console.log('Found by coordinates search:');
                    console.log('Name:', response.results[0].name);
                    console.log('Place ID:', coordSearchPlaceId);
                    
                    testPlaceId(coordSearchPlaceId, (id, hasReviews) => {
                      if (hasReviews) {
                        console.log(`\n✅ SUCCESS! The coordinate-search Place ID (${id}) has reviews.`);
                        showRecommendation(id);
                      } else {
                        console.log('\n❌ None of the tested IDs returned reviews.');
                        showRecommendation(null);
                      }
                    });
                  } else {
                    console.log('❌ Could not find business by coordinates.');
                    showRecommendation(null);
                  }
                });
              }).on('error', (err) => {
                console.error('Error making coordinate search request:', err.message);
                showRecommendation(null);
              });
            }
          });
        }
      });
    } else {
      console.log('❌ Could not find business by name search.');
      
      // Start testing each ID without the name search result
      testPlaceId(addressPlaceId, (id, hasReviews) => {
        if (hasReviews) {
          console.log(`\n✅ SUCCESS! The address-based Place ID (${id}) has reviews.`);
          showRecommendation(id);
        } else {
          // Try the URL format ID
          // For this, we need to search by coordinates
          console.log('\nTrying to search by the coordinates from your Google Maps URL...');
          const lat = 42.0228709;
          const lng = -80.315449;
          const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=Marfinetz%20Plumbing&key=${apiKey}`;
          
          https.get(nearbySearchUrl, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });
            
            res.on('end', () => {
              const response = JSON.parse(data);
              
              if (response.status === 'OK' && response.results && response.results.length > 0) {
                const coordSearchPlaceId = response.results[0].place_id;
                console.log('Found by coordinates search:');
                console.log('Name:', response.results[0].name);
                console.log('Place ID:', coordSearchPlaceId);
                
                testPlaceId(coordSearchPlaceId, (id, hasReviews) => {
                  if (hasReviews) {
                    console.log(`\n✅ SUCCESS! The coordinate-search Place ID (${id}) has reviews.`);
                    showRecommendation(id);
                  } else {
                    console.log('\n❌ None of the tested IDs returned reviews.');
                    showRecommendation(null);
                  }
                });
              } else {
                console.log('❌ Could not find business by coordinates.');
                showRecommendation(null);
              }
            });
          }).on('error', (err) => {
            console.error('Error making coordinate search request:', err.message);
            showRecommendation(null);
          });
        }
      });
    }
  });
}).on('error', (err) => {
  console.error('Error making name search request:', err.message);
});

function showRecommendation(workingPlaceId) {
  console.log('\n========== RECOMMENDATIONS ==========');
  
  if (workingPlaceId) {
    console.log(`1. Update your Google Places API implementation to use this Place ID: ${workingPlaceId}`);
    console.log('2. Modify app/api/google-reviews/route.js to fetch real reviews instead of sample data');
    console.log('3. Test your website to ensure reviews are displayed correctly');
    
    // Show a sample of the code that needs to be updated
    console.log('\nSample code for app/api/google-reviews/route.js:');
    console.log('```javascript');
    console.log('export async function GET() {');
    console.log('  try {');
    console.log('    // Use the Google Places API to fetch real reviews');
    console.log(`    const placeId = '${workingPlaceId}';`);
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
  } else {
    console.log('No working Place ID was found. Consider these options:');
    console.log('1. Verify your Google Business Profile is properly set up and verified');
    console.log('2. Ensure your business address is correctly listed in Google Maps');
    console.log('3. Get some customers to leave reviews on your Google Business Profile');
    console.log('4. Contact Google Support if you continue having issues with your business listing');
  }
  
  console.log('=====================================');
} 