import { NextRequest, NextResponse } from 'next/server';
import { analyzeLeadWithClaude } from './claude-integration';

// Configure CORS headers properly
const getCorsHeaders = () => {
  const allowedOrigins = [
    'https://marfinetzplumbing.org',
    'https://www.marfinetzplumbing.org',
    'https://mmwcontractingorg-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000'
  ];
  
  const origin = process.env.NODE_ENV === 'production' 
    ? 'https://marfinetzplumbing.org' 
    : '*';
    
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
};

const headers = getCorsHeaders();

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    
    // Step 1: Validate lead data
    if (!leadData.name || !leadData.email || !leadData.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers }
      );
    }
    
    // Step 2: Enrich with Claude/Anthropic API
    const claudeAnalysis = await analyzeLeadWithClaude(leadData);
    const enrichedLead = {
      ...leadData,
      claudeAnalysis,
      aiEnriched: true,
      leadScore: calculateInitialScore(leadData)
    };
    
    // Step 3: Send to your lead tracking system on Railway
    try {
      const trackingApiUrl = process.env.NEXT_PUBLIC_TRACKING_API_URL || 'https://mmwcontractingorg-production.up.railway.app';
      const trackingResponse = await fetch(`${trackingApiUrl}/track`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          pageUrl: '/contact-form',
          referrer: leadData.page_url || '',
          timestamp: new Date().toISOString(),
          sessionData: {
            formSubmission: true,
            urgency: leadData.urgency,
            propertyType: leadData.property_type,
            ...enrichedLead
          }
        })
      });
      
      if (!trackingResponse.ok) {
        console.warn('Lead tracking API returned error:', trackingResponse.status);
      }
    } catch (trackingError) {
      // Log the error but don't fail the request
      console.warn('Lead tracking API not available:', trackingError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      emergency: leadData.urgency === 'emergency'
    }, { headers });
    
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers });
}

function calculateInitialScore(leadData: any) {
  let score = 50; // Base score
  
  if (leadData.urgency === 'emergency') score += 40;
  else if (leadData.urgency === 'same_day') score += 30;
  else if (leadData.urgency === 'this_week') score += 20;
  
  if (leadData.property_type === 'commercial') score += 10;
  
  return Math.min(score, 100);
}