# Email Deliverability Guide

This guide will help you fix email spam issues and improve deliverability for lead notifications.

## Current Issues & Solutions

### 1. Fix Sender Name (IMMEDIATE ACTION REQUIRED)
**Problem**: Emails show "Marfinetz Plumbing (Temp)" which looks unprofessional
**Solution**: 
1. Go to Railway dashboard
2. Navigate to your project's environment variables
3. Change `AWS_SES_FROM_NAME` from "Marfinetz Plumbing (Temp)" to "Marfinetz Plumbing"
4. Redeploy the application

### 2. Use Professional Domain Email (CRITICAL)
**Problem**: Using mitchmarfinetz@gmail.com for business emails triggers spam filters
**Solution**: Use a professional email like:
- noreply@marfinetzplumbing.org
- leads@marfinetzplumbing.org
- alerts@marfinetzplumbing.org

### 3. Email Authentication Setup

#### Step 1: Verify Your Domain in AWS SES
1. Log into AWS Console → SES
2. Go to "Verified identities"
3. Click "Create identity" → Choose "Domain"
4. Enter: marfinetzplumbing.org
5. AWS will provide DNS records to add

#### Step 2: Add DNS Records (in your domain registrar)
Add these records to your domain's DNS:

**SPF Record:**
```
Type: TXT
Name: @ (or blank)
Value: "v=spf1 include:amazonses.com ~all"
```

**DKIM Records:** (AWS SES will provide 3 CNAME records)
```
Type: CNAME
Name: [provided by AWS]._domainkey
Value: [provided by AWS].dkim.amazonses.com
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@marfinetzplumbing.org"
```

#### Step 3: Update Environment Variables
In Railway, update these variables:
```
AWS_SES_FROM_EMAIL=noreply@marfinetzplumbing.org
AWS_SES_FROM_NAME=Marfinetz Plumbing
```

### 4. Content Best Practices

#### Subject Lines (Already Fixed)
- ✅ Removed emojis
- ✅ Removed excessive urgency words
- ✅ Professional tone

#### Email Content
- Use proper HTML structure
- Include unsubscribe link (for marketing emails)
- Maintain good text-to-image ratio
- Avoid spam trigger words

### 5. AWS SES Production Access
If still in SES Sandbox mode:
1. Request production access in AWS SES console
2. Fill out the use case form
3. Wait for approval (usually 24 hours)

### 6. Monitor Email Reputation
1. Check AWS SES dashboard for:
   - Bounce rate (keep < 5%)
   - Complaint rate (keep < 0.1%)
2. Set up SNS notifications for bounces/complaints

### 7. Test Email Deliverability
Use these tools to test:
- mail-tester.com
- mxtoolbox.com
- Google Postmaster Tools

## Quick Checklist
- [ ] Remove "(Temp)" from sender name in Railway
- [ ] Set up domain email (not gmail.com)
- [ ] Verify domain in AWS SES
- [ ] Add SPF, DKIM, DMARC records
- [ ] Request SES production access
- [ ] Test with mail-tester.com

## Expected Results
After implementing these changes:
- Emails will land in inbox, not spam
- Professional appearance: "Marfinetz Plumbing <noreply@marfinetzplumbing.org>"
- Better open rates and customer trust
- Compliant with email best practices

## Support
For AWS SES issues: https://docs.aws.amazon.com/ses/
For DNS help: Contact your domain registrar's support