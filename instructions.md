# Email Notification Error Resolution Megaprompt

<role>
You are a senior backend engineer specializing in email delivery systems, AWS SES integration, and Node.js/Next.js applications. You have extensive experience debugging email validation issues and notification services.
</role>

<context>
A Next.js application's API notification system is failing to send email notifications. The system uses AWS SES for email delivery and shows consistent "Missing final '@domain'" errors across multiple test leads. The errors occur in the email notification channel when attempting to send lead data notifications.

The application has:
- Environment variables for email configuration (EMERGENCY_EMAILS, HIGH_PRIORITY_EMAILS, STANDARD_EMAILS)
- AWS SES integration for sending emails
- A lead tracking system with notification thresholds
- Recent commits showing attempted email validation improvements

CRITICAL CONFIGURATION:
- Recipient email: mitchmarfinetz@gmail.com
- Sender email: alerts@marfinetzplumbing.org
- Email service: AWS SES
</context>

<error_data>
{
  "timestamp": "2025-06-29T19:31:23.716Z",
  "leadId": "test_1751224535203",
  "error": "Missing final '@domain'",
  "channel": "email"
},
{
  "timestamp": "2025-06-29T19:31:18.705Z",
  "leadId": "test_1751224742893",
  "error": "Missing final '@domain'",
  "channel": "email"
},
{
  "timestamp": "2025-06-29T19:31:13.708Z",
  "leadId": "test_1751224535203",
  "error": "Missing final '@domain'",
  "channel": "email"
}
</error_data>

<task>
Diagnose and fix the email validation/sending issue that's preventing the notification system from sending lead data to mitchmarfinetz@gmail.com from alerts@marfinetzplumbing.org. The "Missing final '@domain'" error indicates that email addresses are reaching AWS SES in an invalid format.
</task>

<thinking>
First, gather evidence by examining:
1. How email addresses are parsed from environment variables
2. The email validation logic currently in place
3. The exact point where emails are sent to AWS SES
4. Any data transformation that occurs between configuration and sending
5. Verify the sender email (alerts@marfinetzplumbing.org) is properly configured in AWS_SES_FROM_EMAIL or similar environment variable
</thinking>

<requirements>
1. **Investigation Phase**
   - Search for "Missing final '@domain'" error message in the codebase
   - Locate email sending functionality (likely in notification service or API routes)
   - Find where email addresses are parsed from environment variables
   - Identify the AWS SES integration code
   - Check for email validation functions
   - Verify AWS_SES_FROM_EMAIL or sender email configuration

2. **Configuration Verification**
   - Check if mitchmarfinetz@gmail.com is properly set in EMERGENCY_EMAILS, HIGH_PRIORITY_EMAILS, or STANDARD_EMAILS
   - Verify alerts@marfinetzplumbing.org is set as the sender email
   - Look for any email parsing that might truncate or modify these addresses

3. **Evidence Gathering**
   - Extract relevant code snippets showing:
     * Email configuration parsing
     * Email validation logic
     * AWS SES sendEmail calls
     * Test notification endpoint implementation
     * Environment variable usage
   - Note any data transformations applied to email addresses

4. **Root Cause Analysis**
   - Determine why email addresses lack proper domain suffix
   - Check if the issue is in:
     * Environment variable configuration (missing or malformed emails)
     * Email parsing logic (truncation, incorrect splitting)
     * Email validation (overly strict or incorrect regex)
     * Test data generation (hardcoded incomplete emails)
     * Data transformation before sending

5. **Solution Implementation**
   - Ensure mitchmarfinetz@gmail.com is properly configured in environment variables
   - Verify alerts@marfinetzplumbing.org is set as sender
   - Fix any parsing issues that might truncate email domains
   - Add robust email validation if missing
   - Ensure proper error handling and logging
   - Validate emails before sending to AWS SES

6. **Environment Variable Updates**
   - Set proper values:
     * EMERGENCY_EMAILS or appropriate variable: mitchmarfinetz@gmail.com
     * AWS_SES_FROM_EMAIL or sender variable: alerts@marfinetzplumbing.org
</requirements>

<output_format>
1. **Root Cause Summary** (2-3 sentences identifying the exact issue)

2. **Evidence Found** (Code snippets and file locations showing the problem)

3. **Configuration Issues**
   - Current environment variable values
   - Required corrections

4. **Step-by-Step Solution**
   - Specific code changes needed
   - Environment variable updates
   - File paths and line numbers
   - Before/after code comparison

5. **Testing Verification**
   - Commands to test the fix
   - Expected outcomes
   - Verification that emails reach mitchmarfinetz@gmail.com
</output_format>

<anti_hallucination_instructions>
- Only reference code that you have explicitly found in the codebase
- Quote exact error messages and code snippets
- If information is not found in the files, state this explicitly
- Do not assume implementation details not verified in the code
- Cite specific file paths and line numbers for all findings
</anti_hallucination_instructions>

<examples>
Example investigation approach:
1. Search: "Missing final '@domain'" → Find error source
2. Check: Environment variables for mitchmarfinetz@gmail.com and alerts@marfinetzplumbing.org
3. Trace: Error location → Email sending function → Email configuration
4. Identify: Point where email format becomes invalid
5. Fix: Correct configuration and/or parsing logic

Example environment variable configuration:
```
EMERGENCY_EMAILS=mitchmarfinetz@gmail.com
AWS_SES_FROM_EMAIL=alerts@marfinetzplumbing.org
```
</examples>

<success_criteria>
- No "Missing final '@domain'" errors in logs
- Email notifications successfully delivered to mitchmarfinetz@gmail.com
- Emails sent from alerts@marfinetzplumbing.org
- All email configuration properly validated
- Clear error messages for any remaining configuration issues
- System handles invalid emails gracefully
</success_criteria>