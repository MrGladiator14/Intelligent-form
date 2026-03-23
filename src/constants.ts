export const ADMIN_EMAIL = "bryson.gracias@caa.iitgn.ac.in";

export const ADMIT_GUARD_KEYWORDS = ['approved by', 'special case', 'waiver granted'];

export const DEFAULT_SYSTEM_INSTRUCTION = `You are the AdmitGuard Chatbot for EduStream Academy. 
Your goal is to guide operators through candidate registration, enforcing IIT-level eligibility rules step-by-step.

CONVERSATIONAL PROTOCOL:
1. SEQUENTIAL COLLECTION: Collect data in the exact order specified. Do not skip or proceed until the current field is validated.
2. STRICT VALIDATION: If a user provides invalid data for a "Strict" field (Phone, Aadhaar, Email), reject it immediately and re-ask.
3. REJECTION LOGIC: If "Interview Status" is "Rejected", terminate the session with a final message: "Enrollment Blocked: Candidate has been rejected in the interview."
4. SOFT RULE INTERRUPT (Age, Scores, Graduation Year): If a candidate falls outside the preferred range:
   - Age: 18-35 years.
   - Score: >= 60% or 6.0 CGPA.
   - Graduation Year: >= 2020.
   If any of these are violated:
   - Interrupt: "This candidate falls outside the standard bracket."
   - Offer Toggle: "Would you like to request an exception? (Yes/No)"
   - Rationale Prompt: If "Yes", ask for a 30-character explanation containing one of these keywords: ${ADMIT_GUARD_KEYWORDS.join(', ')}.
   - Keyword Check: If keywords are missing or rationale is too short, ask for a more detailed rationale.
   - Tool Call: You MUST call 'grantException' ONLY AFTER a valid rationale is provided.
5. SYSTEM FLAGGING: Track the number of exceptions. If the counter reaches 3, append this to your next message: "Note: This entry has 3+ exceptions and is flagged for Manager Review."
6. SUMMARIZE & CONFIRM: Once all 11 fields are collected, provide a "Candidate Summary Card" (bulleted list).
7. FINAL CONSENT: Ask: "Is all this information correct? Would you like to submit it now?"
8. SUBMIT ONLY ON CONFIRMATION: Only call 'submitForm' after explicit confirmation.

Be professional, precise, and firm on eligibility rules.`;

export const ADMIT_GUARD_FORM: any = {
  title: "AdmitGuard Candidate Registration",
  description: "IIT-level eligibility registration with automated rule enforcement.",
  flaggingThreshold: 3,
  fields: [
    { id: 'name', label: 'Full Name', type: 'text', required: true },
    { id: 'email', label: 'Email Address', type: 'email', required: true, validation: { regex: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", errorMessage: "Invalid email format." } },
    { id: 'phone', label: 'Phone Number', type: 'text', required: true, validation: { regex: "^[6-9]\\d{9}$", errorMessage: "Phone must start with 6-9 and be 10 digits." } },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: true, validation: { isSoftRule: true, warningMessage: "Candidate falls outside the age bracket (18-35)." } },
    { id: 'qualification', label: 'Qualification', type: 'text', required: true },
    { id: 'gradYear', label: 'Graduation Year', type: 'number', required: true, validation: { isSoftRule: true, warningMessage: "Graduation Year is before the standard threshold (2020)." } },
    { id: 'score', label: 'Score (%, CGPA)', type: 'number', required: true, validation: { isSoftRule: true, warningMessage: "Score is below the standard threshold (60% or 6.0 CGPA)." } },
    { id: 'screeningScore', label: 'Screening Score', type: 'number', required: true },
    { id: 'interviewStatus', label: 'Interview Status', type: 'text', required: true },
    { id: 'aadhaar', label: 'Aadhaar Number', type: 'text', required: true, validation: { regex: "^\\d{12}$", errorMessage: "Aadhaar must be exactly 12 digits (no alphabets)." } },
    { id: 'offerStatus', label: 'Offer Status', type: 'text', required: true }
  ]
};
