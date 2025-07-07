# Claude Prompting Guide - How to Get Better Analysis

## The Problem

Claude can jump to conclusions and make assumptions without proper
investigation, leading to:

- False positive security vulnerabilities
- Incorrect assessments based on incomplete analysis
- Wasted time on non-issues
- Loss of trust in the analysis

## Better Prompting Strategies

### 1. Demand Evidence and Verification

**Instead of**: "Do a security audit"

**Use**: "Do a security audit, but for each potential issue you
identify, you must:

1. Show me the exact code that creates the vulnerability
2. Demonstrate how an attacker would exploit it
3. Test your claims by actually trying the attack if possible
4. Trace the data flow from user input to unsafe output"

### 2. Require Step-by-Step Investigation

**Add this to prompts**: "Before making any claims about
vulnerabilities:

1. Read and understand the actual code implementation
2. Trace data sources to determine if they're user-controlled or
   trusted
3. Test your assumptions with real examples
4. Only flag issues you can prove are exploitable"

### 3. Ask for Self-Correction

**Include**: "After your initial analysis, review each finding and ask
yourself:

- Did I actually verify this is exploitable?
- Am I making assumptions about how this code works?
- Have I traced the data flow completely?
- Can I demonstrate this vulnerability with a working example?"

### 4. Demand Practical Validation

**Require**: "For any security issue you identify, show me:

1. The exact steps to reproduce the vulnerability
2. A working proof-of-concept if claiming XSS/injection
3. Evidence that the issue actually exists in the running application
4. Confirmation that this isn't just theoretical or protected by other
   measures"

### 5. Focus on Real Impact

**Ask**: "Focus only on vulnerabilities that:

- Can be exploited by real attackers
- Have actual security impact
- Are not protected by framework safeguards
- You can demonstrate with working examples"

## Example Good Prompt

```
Analyze this codebase for security issues, but I want high-quality analysis:

1. For each potential vulnerability, provide a working proof-of-concept
2. Trace data flows completely - don't assume user input reaches unsafe outputs
3. Test your findings against the actual running application when possible
4. Distinguish between theoretical issues and actual exploitable vulnerabilities
5. If you make any claims about XSS, CSRF, or injection attacks, prove them with examples
6. Before finalizing any findings, double-check your assumptions by reading the code again

I want accuracy over comprehensiveness. It's better to find 2 real issues than 10 false positives.
```

## Red Flags in Claude's Analysis

Watch out for these warning signs:

- Claims about vulnerabilities without showing exploitation steps
- Assumptions about how frameworks work without verification
- Generic "this could be dangerous" without specific attack scenarios
- Long lists of theoretical issues without proof
- Failure to distinguish between user-controlled and trusted data

## How to Push Back

When Claude makes unsubstantiated claims:

- "Show me exactly how an attacker would exploit this"
- "Trace the data flow for me - where does user input enter and how
  does it reach the vulnerable output?"
- "Test this vulnerability and show me it actually works"
- "Are you making assumptions about how this framework/library works?"

## Success Metrics

A good security analysis should:

- Have fewer, but verified findings
- Include working proof-of-concepts
- Show understanding of the actual codebase
- Distinguish between theory and practice
- Admit uncertainty when claims can't be verified

---

**Remember**: It's better to have Claude say "I can't find any
exploitable vulnerabilities" than to waste time chasing false
positives based on assumptions and incomplete analysis.
