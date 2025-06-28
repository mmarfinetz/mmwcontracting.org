import Anthropic from '@anthropic-ai/sdk';

export async function analyzeLeadWithClaude(leadData: any) {
  try {
    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('Anthropic API key not configured, using fallback analysis');
      return {
        leadScore: calculateFallbackScore(leadData),
        urgencyAssessment: leadData.urgency || 'normal',
        responseTime: getResponseTime(leadData.urgency),
        talkingPoints: generateFallbackTalkingPoints(leadData)
      };
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `Analyze this plumbing service lead and provide:
1. Lead quality score (0-100)
2. Urgency assessment
3. Recommended response time
4. Key talking points for the plumber

Lead Information:
- Name: ${leadData.name}
- Problem: ${leadData.problem}
- Urgency: ${leadData.urgency}
- Property Type: ${leadData.property_type}
- Location: ${leadData.location}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content;
  } catch (error) {
    console.error('Claude API error:', error);
    // Return fallback analysis if Claude API fails
    return {
      leadScore: calculateFallbackScore(leadData),
      urgencyAssessment: leadData.urgency || 'normal',
      responseTime: getResponseTime(leadData.urgency),
      talkingPoints: generateFallbackTalkingPoints(leadData)
    };
  }
}

function calculateFallbackScore(leadData: any) {
  let score = 50; // Base score
  
  if (leadData.urgency === 'emergency') score += 40;
  else if (leadData.urgency === 'same_day') score += 30;
  else if (leadData.urgency === 'this_week') score += 20;
  
  if (leadData.property_type === 'commercial') score += 10;
  
  return Math.min(score, 100);
}

function getResponseTime(urgency: string) {
  switch (urgency) {
    case 'emergency': return '15 minutes';
    case 'same_day': return '2 hours';
    case 'this_week': return '24 hours';
    default: return '24 hours';
  }
}

function generateFallbackTalkingPoints(leadData: any) {
  const points = ['Professional licensed plumbing service'];
  
  if (leadData.urgency === 'emergency') {
    points.push('Emergency response available');
  }
  
  if (leadData.property_type === 'commercial') {
    points.push('Commercial plumbing expertise');
  }
  
  points.push('Free estimates and transparent pricing');
  
  return points;
}