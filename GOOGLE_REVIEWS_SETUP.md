# Google Reviews Integration Setup

This document explains how to fully set up the Google Reviews integration for MMW Contracting website.

## Requirements

- Google Cloud account
- Google Places API key

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Enable billing for your project

## Step 2: Enable the Google Places API

1. Go to the [API Library](https://console.cloud.google.com/apis/library) in Google Cloud Console
2. Search for "Places API"
3. Select and enable the Places API for your project

## Step 3: Create API Key

1. Go to [Credentials page](https://console.cloud.google.com/apis/credentials)
2. Click "Create credentials" and select "API key"
3. Once created, restrict the API key to only the Places API for security
4. Set HTTP referrer restrictions to your website's domain

## Step 4: Add API Key to Environment Variables

1. Open the `.env.local` file in the project root
2. Add your API key to the `GOOGLE_PLACES_API_KEY` variable:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

## Step 5: Deploy Your Website

1. Make sure to add the environment variable to your hosting platform (Vercel, Netlify, etc.)
2. Deploy your website

## Troubleshooting

- If reviews don't load, check the browser console for errors
- Verify the API key is correctly set in the environment variables
- Make sure the Place ID in the API endpoint is correct (currently set to: `ChIJ5SN41h5KzYkRo5dnBsiFcxM`)
- Check Google Cloud Console to ensure you haven't exceeded API quotas

## Review Link

The direct link for customers to leave a review is:
```
https://g.page/r/CaM5Z6DIV3MTEAE/review
```

This link is already integrated in the "Leave a Review" button in the testimonials window.