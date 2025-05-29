// Simple script to find the correct Google Place ID from the Maps URL
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!apiKey) {
  console.error('API key not found in .env.local file');
  process.exit(1);
}

// The coordinates from the Google Maps URL
const lat = 42.0228709;
const lng = -80.315449;

console.log('Searching for Marfinetz Plumbing near the coordinates from your Google Maps URL...');
console.log(`Latitude: ${lat}, Longitude: ${lng}`);

// Try a few different search methods
const methods = [
  {
    name: 'Basic Nearby Search',
    url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&keyword=Marfinetz%20Plumbing&key=${apiKey}`
  },
  {
    name: 'Text Search with location',
    url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Marfinetz%20Plumbing&location=${lat},${lng}&radius=1000&key=${apiKey}`
  },
  {
    name: 'Find Place with text query',
    url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Marfinetz%20Plumbing&inputtype=textquery&locationbias=circle:1000@${lat},${lng}&fields=place_id,name,formatted_address&key=${apiKey}`
  },
  {
    name: 'Text Search with exact name and city',
    url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Marfinetz%20Plumbing%20Lake%20City%20PA&key=${apiKey}`
  }
];

// Execute each search method
let methodIndex = 0;
searchNext();

function searchNext() {
  if (methodIndex >= methods.length) {
    console.log('\n❌ No methods were successful in finding your business.');
    console.log('\nLast resort - let\'s try a direct way to convert the CID to a Place ID:');
    const cid = '1392114939835088803'; // Extracted from the URL format: 0x137357c8a06739a3
    console.log(`Testing with CID: ${cid}`);
    
    // Make a search using this CID
    const cidUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=cid:${cid}&key=${apiKey}`;
    
    https.get(cidUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const response = JSON.parse(data);
        
        if (response.status === 'OK' && response.results && response.results.length > 0) {
          console.log('\n✅ Found your business using the CID!');
          console.log('Name:', response.results[0].name);
          console.log('Address:', response.results[0].formatted_address);
          console.log('Place ID:', response.results[0].place_id);
          
          // Test if this place ID has reviews
          testPlaceId(response.results[0].place_id);
        } else {
          console.log('❌ Could not find your business using the CID either.');
          console.log('\nRecommendation: Please use the review link shown on your own Google Business Profile dashboard.');
          console.log('It should be something like: https://g.page/r/PLACE_ID/review');
        }
      });
    }).on('error', (err) => {
      console.error('Error making CID search request:', err.message);
    });
    
    return;
  }
  
  const method = methods[methodIndex];
  console.log(`\nTrying method: ${method.name}`);
  
  https.get(method.url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const response = JSON.parse(data);
      
      if (
        (response.status === 'OK') && 
        (
          (response.results && response.results.length > 0) || 
          (response.candidates && response.candidates.length > 0)
        )
      ) {
        const results = response.results || response.candidates;
        console.log(`✅ Found ${results.length} results using ${method.name}:`);
        
        results.forEach((result, index) => {
          console.log(`\nResult #${index + 1}:`);
          console.log('Name:', result.name);
          if (result.formatted_address) {
            console.log('Address:', result.formatted_address);
          }
          console.log('Place ID:', result.place_id);
        });
        
        // Test if the first result has reviews
        testPlaceId(results[0].place_id);
      } else {
        console.log(`❌ No results found using ${method.name}`);
        methodIndex++;
        searchNext();
      }
    });
  }).on('error', (err) => {
    console.error(`Error with ${method.name}:`, err.message);
    methodIndex++;
    searchNext();
  });
}

function testPlaceId(placeId) {
  console.log(`\nTesting if Place ID: ${placeId} has reviews...`);
  
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
          console.log('\n✅ SUCCESS! Reviews found for this Place ID!');
          console.log(`Number of reviews: ${response.result.reviews.length}`);
          
          response.result.reviews.forEach((review, index) => {
            console.log(`\nReview #${index + 1}:`);
            console.log(`Author: ${review.author_name}`);
            console.log(`Rating: ${review.rating}/5`);
            console.log(`Text: ${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}`);
          });
          
          console.log('\n========== RECOMMENDATION ==========');
          console.log(`Update your app/api/google-reviews/route.js file to use this Place ID: ${placeId}`);
          console.log('\nReplace the sample data with:');
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
          console.log('===================================');
        } else {
          console.log('⚠️ No reviews found for this Place ID.');
          methodIndex++;
          searchNext();
        }
      } else {
        console.error('❌ Place Details API request failed:', response.status);
        console.error('Error message:', response.error_message || 'None provided');
        methodIndex++;
        searchNext();
      }
    });
  }).on('error', (err) => {
    console.error('Error making details request:', err.message);
    methodIndex++;
    searchNext();
  });
} 