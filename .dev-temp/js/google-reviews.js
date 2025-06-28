// Google Reviews API with error handling and performance optimizations
let reviewsLoaded = false;

function loadGoogleReviews() {
  // Only load once
  if (reviewsLoaded) return;
  
  const reviewsContainer = document.getElementById('google-reviews');
  if (!reviewsContainer) return;
  
  // Show loading state
  reviewsContainer.innerHTML = '<div class="loading-reviews">Loading reviews...</div>';
  
  // Server-side proxy instead of CORS Anywhere
  const API_URL = '/api/google-reviews'; // Server endpoint
  
  // Use native fetch API with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  fetch(API_URL, {
    signal: controller.signal,
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      reviewsLoaded = true;
      
      if (!data || !data.result || !data.result.reviews) {
        throw new Error('Invalid data format');
      }
      
      const reviews = data.result.reviews;
      if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>No reviews available at this time.</p>';
        return;
      }
      
      // Process reviews
      let reviewsHTML = '';
      
      reviews.slice(0, 5).forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const timeAgo = review.relative_time_description || formatTimeAgo(new Date(review.time * 1000));
        
        reviewsHTML += `
          <div class="google-review">
            <div class="review-header">
              <img src="${review.profile_photo_url || 'img/wxp_186.png'}" alt="${review.author_name}" 
                   class="review-avatar" loading="lazy">
              <div class="review-user">
                <div class="review-name">${review.author_name}</div>
                <div class="review-rating">${stars}</div>
                <div class="review-time">${timeAgo}</div>
              </div>
            </div>
            <div class="review-text">${review.text}</div>
          </div>
        `;
      });
      
      // Add a link to see more reviews
      reviewsHTML += `
        <div class="reviews-footer">
          <a href="${data.result.url}" target="_blank" rel="noopener">View all reviews on Google</a>
          <p class="reviews-rating">Overall rating: ${data.result.rating} ★</p>
        </div>
      `;
      
      reviewsContainer.innerHTML = reviewsHTML;
    })
    .catch(error => {
      console.error('Error fetching Google reviews:', error);
      reviewsContainer.innerHTML = `
        <div class="review-error">
          <p>Unable to load reviews at this time.</p>
          <p>Please check out our <a href="https://g.page/r/CaM5Z6DIV3MTEAE/review" 
             target="_blank" rel="noopener">Google Business Profile</a> to see customer reviews.</p>
        </div>
      `;
    });
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}