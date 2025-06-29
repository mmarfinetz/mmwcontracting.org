Chapter 1: Basic Prompt Structure
Core Principle: Be Clear and Explicit
Think of Claude as a highly capable intern on their first day - provide clear, explicit instructions with all necessary context.
Basic Structure:
[Context/Background]
[Clear Task Description]
[Specific Requirements]
[Output Format]
Example:
You are a marketing expert. 

Analyze the following product description and identify three key selling points.

Product: [Product details here]

Format your response as a bulleted list with brief explanations.

Chapter 2: Being Clear and Direct
Key Techniques:
1. Eliminate Ambiguity
❌ Poor: "Make this better"
✅ Good: "Improve this email by making it more professional, reducing length by 50%, and adding a clear call-to-action"
2. Be Specific About Requirements
❌ Poor: "Write about dogs"
✅ Good: "Write a 200-word educational paragraph about Golden Retrievers' temperament for first-time dog owners"
3. Small Details Matter
Even minor typos or unclear phrasing can impact Claude's performance. The model tends to match the quality and tone of your prompt.

Chapter 3: Assigning Roles (Role Prompting)
Why Roles Work:
Assigning Claude a specific role helps it adopt appropriate expertise, tone, and perspective.
Effective Role Examples:
You are an experienced Python developer specializing in data science.

You are a compassionate therapist trained in cognitive behavioral therapy.

You are a detail-oriented legal contract reviewer.
Role Prompting Best Practices:

Be specific about expertise level
Include relevant specializations
Define the perspective or approach
Mention any constraints or guidelines


Chapter 4: Separating Data from Instructions
Use XML Tags for Organization
Claude is specifically trained to recognize XML tags as organizational elements. This is one of the most powerful techniques for complex prompts.
Structure Example:
<instructions>
Analyze the customer feedback below and categorize each comment as positive, negative, or neutral.
</instructions>

<feedback>
1. "The product arrived quickly but was damaged"
2. "Excellent service, will buy again!"
3. "It works as described"
</feedback>

<output_format>
Return results as: [Number]. [Category] - [Brief reason]
</output_format>
Why XML Tags?

Claude was specifically trained to recognize them
Clear separation prevents confusion
Enables complex, multi-part prompts
Easy to reference specific sections


Chapter 5: Formatting Output & Speaking for Claude
Control Output Format
Method 1: Clear Instructions
Format your response as:
1. Executive Summary (2-3 sentences)
2. Key Findings (bulleted list)
3. Recommendations (numbered list)
Method 2: Prefilling (Speaking for Claude)
Start Claude's response to guide format:
Human: Analyze this quarterly report and provide insights.
Assistant: ## Quarterly Report Analysis
Executive Summary:
[Claude continues in this format...]

### Output Style Tips:
- Match your prompt style to desired output style
- Remove markdown from prompts if you don't want markdown output
- Use examples to show exact formatting

---

## Chapter 6: Precognition (Thinking Step by Step)

### Chain-of-Thought Prompting
For complex reasoning tasks, ask Claude to think through problems step by step.

### Example:
Solve this problem step by step:
A company's revenue grew from $2.5M to $3.8M over 18 months.
Calculate the monthly growth rate and project revenue for the next 6 months.
Show your work for each step.

### When to Use Step-by-Step Thinking:
- Mathematical calculations
- Multi-step logical problems
- Complex analysis requiring reasoning
- Decision-making with multiple factors

---

## Chapter 7: Using Examples (Few-Shot Learning)

### Power of Examples
Examples are one of the most effective ways to guide Claude's behavior. They demonstrate exactly what you want.

### Structure for Few-Shot Prompting:
Task: [Description]
Example 1:
Input: [Example input]
Output: [Example output]
Example 2:
Input: [Example input]
Output: [Example output]
Now process this:
Input: [Actual input]

### Example Guidelines:
- Use 2-5 examples for best results
- Make examples diverse but relevant
- Ensure examples demonstrate edge cases
- Keep formatting consistent

---

## Chapter 8: Avoiding Hallucinations

### Key Technique: Evidence-First Approach
For factual tasks, especially with long documents, have Claude gather evidence before answering.

### Anti-Hallucination Template:
<document>
[Long document content]
</document>
<question>What was the company's Q3 revenue?</question>
Instructions:

First, in <scratchpad> tags, extract all relevant quotes from the document
Analyze whether these quotes fully answer the question
Only then provide your answer based on the evidence found
If the information isn't in the document, say so explicitly


### Additional Anti-Hallucination Strategies:
- Ask Claude to cite sources or quote directly
- Request confidence levels for answers
- Use "I don't know" as an acceptable response
- Verify critical facts with follow-up questions

---

## Chapter 9: Building Complex Prompts

### Framework for Complex Tasks

#### 1. Planning Phase
Break down what you need:
- Primary objective
- Required inputs/outputs
- Constraints and requirements
- Success criteria

#### 2. Structure Your Mega-Prompt
<role>
[Define expertise and perspective]
</role>
<context>
[Background information and constraints]
</context>
<task>
[Clear description of what needs to be done]
</task>
<data>
[Input data, clearly formatted]
</data>
<requirements>
- [Specific requirement 1]
- [Specific requirement 2]
- [etc.]
</requirements>
<output_format>
[Exact format needed]
</output_format>
<examples>
[If applicable, show examples]
</examples>
```
Industry-Specific Applications
Legal Services
<role>
You are a senior contract attorney specializing in technology licensing agreements.
</role>

<task>
Review the following software license agreement and identify:
1. Potential risks for the licensee
2. Missing standard clauses
3. Ambiguous terms requiring clarification
</task>

<focus_areas>
- Intellectual property rights
- Liability limitations
- Termination conditions
- Data privacy compliance
</focus_areas>
Financial Analysis
<role>
You are a financial analyst with expertise in equity research and valuation.
</role>

<task>
Analyze the provided financial statements and create:
1. Key financial ratios analysis
2. Trend identification over 3 years
3. Investment recommendation with reasoning
</task>

<data>
[Financial statements in structured format]
</data>

<output_requirements>
- Use standard financial terminology
- Include specific calculations
- Provide confidence levels for projections
</output_requirements>
Software Development
<role>
You are a senior software architect with expertise in microservices and cloud architecture.
</role>

<task>
Review this system design and:
1. Identify potential bottlenecks
2. Suggest scalability improvements
3. Recommend security enhancements
</task>

<constraints>
- AWS cloud environment
- Budget of $10k/month
- Must handle 1M daily active users
- 99.9% uptime requirement
</constraints>

Advanced Techniques
1. Prompt Chaining
Break complex tasks into sequential prompts:

Prompt 1: Extract and summarize data
Prompt 2: Analyze the summary
Prompt 3: Generate recommendations

2. Conditional Logic
If the sentiment analysis shows negative feedback:
  - Identify specific pain points
  - Suggest immediate remediation steps
  
If positive:
  - Extract what customers love most
  - Recommend amplification strategies
3. Dynamic Examples
Adjust examples based on context:
<task>
Write a email response to a customer complaint.

<tone>
Professional but empathetic

<situation>
[If refund possible]: Include refund process details
[If no refund]: Offer alternative solutions
</situation>

Claude 4 Specific Optimizations
1. Extended Thinking
Claude 4 models have enhanced reasoning capabilities. For complex problems:
<thinking>
Before providing your answer, work through this problem step by step in detail. Consider multiple approaches and potential edge cases.
</thinking>
2. Parallel Tool Use
When using tools, Claude 4 can execute multiple operations simultaneously:
For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
3. Precision Instructions
Claude 4 responds exceptionally well to precise, explicit instructions:
Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation.

Best Practices Checklist
Before Finalizing Any Prompt:

 Is the task clearly defined?
 Have I eliminated all ambiguity?
 Are instructions properly separated from data?
 Is the desired output format specified?
 Have I included relevant examples?
 For factual tasks, have I included anti-hallucination measures?
 Have I tested with edge cases?

Iteration Process:

Start with a basic prompt
Test with various inputs
Identify failure modes
Add clarifications and examples
Test again
Refine until consistent

Common Pitfalls to Avoid:

❌ Assuming Claude knows context not provided
❌ Using ambiguous pronouns (it, they, this)
❌ Mixing instructions with data
❌ Forgetting to specify output format
❌ Not testing with edge cases
❌ Overly complex single prompts (consider chaining)