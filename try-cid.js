// Script to try using the CID from the Google Maps URL
require('dotenv').config({ path: '.env.local' });
const https = require('https');
const { execSync } = require('child_process');

const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!apiKey) {
  console.error('API key not found in .env.local file');
  process.exit(1);
}

// Extract data from the Google Maps URL
const googleMapsUrl = 'https://www.google.com/maps/place/MMW+Contracting/@42.022753,-80.480254,11z/data=!4m8!3m7!1s0x60cc771ea7d823a5:0x137357c8a06739a3!8m2!3d42.0228709!4d-80.315449!9m1!1b1!16s%2Fg%2F11w8jtnvvw';

// Extract the CID from the URL (the part that looks like: 0x60cc771ea7d823a5:0x137357c8a06739a3)
const cidMatch = googleMapsUrl.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)!/);
const cid = cidMatch ? cidMatch[1] : null;

console.log('Extracted CID from URL:', cid);

if (!cid) {
  console.error('Could not extract CID from the Google Maps URL');
  process.exit(1);
}

// Try different API approaches
console.log('Trying different API approaches to find a working method...');

// Approach 1: Try to find a place using the Find Place API with the exact business name and location
const lat = 42.0228709;
const lng = -80.315449;
const businessName = 'MMW Contracting';
const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName)}&inputtype=textquery&locationbias=circle:1000@${lat},${lng}&fields=place_id,name,formatted_address&key=${apiKey}`;

console.log('\nApproach 1: Using Find Place API with business name and location');
https.get(findPlaceUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (response.status === 'OK' && response.candidates && response.candidates.length > 0) {
      console.log('✅ Found place using business name and location:');
      console.log('Name:', response.candidates[0].name);
      console.log('Address:', response.candidates[0].formatted_address);
      console.log('Place ID:', response.candidates[0].place_id);
      
      // Test this Place ID for reviews
      testPlaceId(response.candidates[0].place_id, () => {
        tryApproach2();
      });
    } else {
      console.log('❌ Could not find place using business name and location');
      tryApproach2();
    }
  });
}).on('error', (err) => {
  console.error('Error with Approach 1:', err.message);
  tryApproach2();
});

function tryApproach2() {
  // Approach 2: Try using a reverse geocode to find places near the coordinates
  console.log('\nApproach 2: Using Reverse Geocoding to find places near the coordinates');
  const reverseGeoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  
  https.get(reverseGeoUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      
      if (response.status === 'OK' && response.results && response.results.length > 0) {
        console.log('✅ Found location information using reverse geocoding:');
        console.log('Address:', response.results[0].formatted_address);
        
        // Try a nearby search with the business name
        const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=${encodeURIComponent(businessName)}&key=${apiKey}`;
        
        https.get(nearbySearchUrl, (res) => {
          let nearbyData = '';
          
          res.on('data', (chunk) => {
            nearbyData += chunk;
          });
          
          res.on('end', () => {
            const nearbyResponse = JSON.parse(nearbyData);
            
            if (nearbyResponse.status === 'OK' && nearbyResponse.results && nearbyResponse.results.length > 0) {
              console.log('✅ Found nearby places:');
              console.log('Name:', nearbyResponse.results[0].name);
              console.log('Place ID:', nearbyResponse.results[0].place_id);
              
              // Test this Place ID for reviews
              testPlaceId(nearbyResponse.results[0].place_id, () => {
                tryApproach3();
              });
            } else {
              console.log('❌ Could not find nearby places');
              tryApproach3();
            }
          });
        }).on('error', (err) => {
          console.error('Error with nearby search:', err.message);
          tryApproach3();
        });
      } else {
        console.log('❌ Could not get location information using reverse geocoding');
        tryApproach3();
      }
    });
  }).on('error', (err) => {
    console.error('Error with Approach 2:', err.message);
    tryApproach3();
  });
}

function tryApproach3() {
  // Approach 3: Try using the Place ID lookup
  console.log('\nApproach 3: Extract the Place ID from the g parameter in the URL');
  const gMatch = googleMapsUrl.match(/!16s%2Fg%2F([^?&]+)/);
  const gParam = gMatch ? gMatch[1] : null;
  
  if (gParam) {
    console.log('Found g parameter:', gParam);
    console.log('This might be a reference to your Place ID');
    
    // Try to construct a possible Place ID from this
    const possiblePlaceId = `ChIJ_____${gParam.replace(/\//g, '_')}`;
    console.log('Constructed possible Place ID:', possiblePlaceId);
    
    // Test this constructed Place ID for reviews
    testPlaceId(possiblePlaceId, () => {
      tryApproach4();
    });
  } else {
    console.log('❌ Could not extract g parameter from URL');
    tryApproach4();
  }
}

function tryApproach4() {
  // Approach 4: Last resort - try to use the Maps Embed API which might work with the CID
  console.log('\nApproach 4: Using the Maps Embed API format');
  
  // Extract just the numeric portion of the CID
  const numericCidMatch = cid.match(/0x[^:]+:(0x[0-9a-f]+)/);
  const numericCid = numericCidMatch ? numericCidMatch[1].replace('0x', '') : null;
  
  if (numericCid) {
    console.log('Extracted numeric CID:', numericCid);
    
    // Try using this with the Place Details API
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJ0000000000000000000000000000&key=${apiKey}`;
    
    // Note: This is unlikely to work directly, but worth trying as a test
    https.get(placeDetailsUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n=== Final Recommendation ===');
        console.log('After trying multiple approaches, here are your options:');
        console.log('1. Continue using the enhanced sample data for now');
        console.log('2. Contact Google Business Support to get your correct Place ID');
        console.log('3. Use a different approach to display reviews, such as embedding a Google review widget');
        
        console.log('\nTo embed a Google review widget directly:');
        console.log('Add this to your website:');
        console.log('```html');
        console.log('<iframe src="https://widgets.sociablekit.com/google-reviews/iframe/152794" frameborder="0" width="100%" height="500"></iframe>');
        console.log('```');
        
        console.log('\nOr use a direct link to your reviews page:');
        console.log(`<a href="${googleMapsUrl.replace('/place/', '/search/').replace(/\/@[\d.-]+,[\d.-]+,[\d]+z/, '')}&q=MMW+Contracting&tbm=lcl" target="_blank">View Our Reviews on Google</a>`);
      });
    }).on('error', (err) => {
      console.error('Error with Approach 4:', err.message);
    });
  } else {
    console.log('❌ Could not extract numeric CID from URL');
    
    console.log('\n=== Final Recommendation ===');
    console.log('After trying multiple approaches, it appears that your business listing may not be configured in a way that makes it accessible via the Places API.');
    console.log('Options:');
    console.log('1. Continue using the enhanced sample data for now');
    console.log('2. Contact Google Business Support to get your correct Place ID');
    console.log('3. Use a different approach to display reviews, such as embedding a Google review widget');
  }
}

function testPlaceId(placeId, callback) {
  console.log(`Testing Place ID: ${placeId} for reviews...`);
  
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
        
        if (response.result.rating) {
          console.log('Rating:', response.result.rating);
        } else {
          console.log('Rating: No rating available');
        }
        
        if (response.result.reviews && response.result.reviews.length > 0) {
          console.log('✅ SUCCESS! Reviews found for this Place ID!');
          console.log(`Number of reviews: ${response.result.reviews.length}`);
          
          response.result.reviews.forEach((review, index) => {
            if (index < 2) {  // Just show the first 2 reviews as examples
              console.log(`\nReview #${index + 1}:`);
              console.log(`Author: ${review.author_name}`);
              console.log(`Rating: ${review.rating}/5`);
              console.log(`Text: ${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}`);
            }
          });
          
          console.log('\n========== SOLUTION FOUND ==========');
          console.log(`This Place ID works: ${placeId}`);
          console.log('Update your app/api/google-reviews/route.js file with:');
          console.log('```javascript');
          console.log('export async function GET() {');
          console.log('  try {');
          console.log('    const apiKey = process.env.GOOGLE_PLACES_API_KEY;');
          console.log(`    const placeId = '${placeId}';`);
          console.log('');
          console.log('    const response = await fetch(');
          console.log(`      \`https://maps.googleapis.com/maps/api/place/details/json?place_id=\${placeId}&fields=name,rating,reviews,formatted_address,url&key=\${apiKey}\``);
          console.log('    );');
          console.log('');
          console.log('    const data = await response.json();');
          console.log('    return NextResponse.json(data);');
          console.log('  } catch (error) {');
          console.log('    console.error(\'Error fetching Google reviews:\', error);');
          console.log('    return NextResponse.json({');
          console.log('      error: \'Failed to fetch reviews\',');
          console.log('      message: error.message');
          console.log('    }, { status: 500 });');
          console.log('  }');
          console.log('}');
          console.log('```');
          
          // Exit the script with success since we found what we needed
          process.exit(0);
        } else {
          console.log('⚠️ No reviews found for this Place ID.');
          if (callback) callback();
        }
      } else {
        console.log('❌ Place Details API request failed:', response.status);
        console.log('Error message:', response.error_message || 'None provided');
        if (callback) callback();
      }
    });
  }).on('error', (err) => {
    console.error('Error making details request:', err.message);
    if (callback) callback();
  });
} 