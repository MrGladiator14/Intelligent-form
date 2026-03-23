# AdmitGuard: AI-Powered IIT-Level Admissions

AdmitGuard is a next-generation, AI-powered admissions and data collection platform. It replaces traditional, static web forms with an intelligent, conversational interface that enforces IIT-level eligibility rules in real-time, extracts information from documents, and flags high-exception entries for human review.

## 📸 Visual Overview

Explore the interface and AI-driven features through these screenshots:

*   **[Admin Form Management Dashboard](https://drive.google.com/file/d/1TCGR6jfMDyVyP5VkKQVIJLFAPdPc4iG6/view?usp=sharing)**: Create and manage dynamic AI-powered forms.
*   **[Conversational AI Interface](https://drive.google.com/file/d/1uC9eZjbbseGdTR5iQLGyF4rokuPONAWV/view?usp=sharing)**: A friendly chat-based experience for data collection.
*   **[Intelligent Document Verification](https://drive.google.com/file/d/1vv_GcHQj5EBHPnzaVAI3n0p-MZN8OXwZ/view?usp=sharing)**: AI detecting a name mismatch in an uploaded document.
*   **[Summary & Confirmation Step](https://drive.google.com/file/d/13l8o-vBjR2C3kOZgs3b7dbUj9XKdV3BM/view?usp=sharing)**: AI presenting a summary and asking for explicit user consent before submission.
*   **[Submission Success Confirmation](https://drive.google.com/file/d/1uX0KsTX5uFkv09ZF3kShITMHSU-bGQyS/view?usp=sharing)**: Final confirmation screen after successful data storage.

---

## 🚀 Key Features

### 1. AdmitGuard Eligibility Protocol
The system enforces a strict sequential collection process, ensuring no data is skipped and every field meets the required standards before proceeding.
*   **Strict Validation**: Fields like **Phone Number**, **Aadhaar**, and **Email** are non-negotiable. The AI rejects invalid formats immediately.
*   **Soft Rule Exceptions**: For fields like **Age**, **Score**, and **Graduation Year**, the AI allows for exceptions if a valid rationale (containing keywords like "waiver granted" or "special case") is provided.
*   **Manager Review Flagging**: If an entry accumulates **3 or more exceptions**, the AI automatically flags it for "Manager Review" with a high-visibility visual alert in the chat.

### 2. AI-Powered Conversational Interface
Users don't fill out forms; they have a conversation. The AI agent guides users through the process, asking questions one by one.
*   **Message Splitting**: Bot responses are split into separate, easy-to-read bubbles, separating confirmations from new questions.
*   **Contextual Assistance**: The AI understands the purpose of the form and provides helpful prompts.
*   **Natural Language Processing**: Users can respond naturally, and the AI extracts the relevant data points.

### 3. Intelligent Verification & Clarification
The AI acts as a smart gatekeeper, ensuring high-quality data collection.
*   **Real-time Validation**: The AI checks if responses make sense for the field (e.g., verifying Aadhaar digits or email patterns).
*   **Clarification Dialogue**: If a response is vague or potentially incorrect, the AI will engage in a chat to get more details before proceeding.
*   **Discrepancy Detection**: The AI can detect mismatches (e.g., an uploaded document belonging to a different person than the applicant).

### 4. Multimodal Document Scanning
Users can upload PDFs, images, or text files. The AI agent scans these documents to:
*   **Extract Data**: Automatically pull information from documents to pre-fill form fields.
*   **Verify Content**: Ensure the document content matches the user's claims.
*   **Support Formats**: Full support for PDF, PNG, JPG, and TXT files.

### 5. Summary & Explicit Confirmation
To prevent accidental submissions, the AI provides a full "Candidate Summary Card". It requires explicit user confirmation before calling the submission tool.

---

## 🛠 Technical Architecture

### Authentication
*   **Firebase Authentication**: Secure Google Login for both administrators and operators.
*   **Role-Based Access**: The system distinguishes between the primary administrator (owner) and regular operators.

### Database (Firestore)
*   **`forms` Collection**: Stores form definitions, field types, and flagging thresholds.
*   **`submissions` Collection**: Stores completed candidate data, including exception counts and flagging status.
*   **Security Rules**: Robust Firestore rules ensure that:
    *   Only admins can create/edit forms.
    *   Operators can only see forms they are authorized to access.
    *   Operators can only read their own submissions.

### AI Integration (Gemini 3 Flash)
*   **Multimodal Processing**: Uses the `@google/genai` SDK to process both text and file data.
*   **Tool Calling**: The AI uses `grantException` and `submitForm` tools to interact with the backend.
*   **System Instructions**: A complex set of instructions governs the AI's behavior regarding verification, exception handling, and summary generation.

---

## 📱 User Flow

1.  **Login**: User authenticates via Google.
2.  **Select Form**: User chooses an available form (e.g., AdmitGuard Registration).
3.  **Chat**: The AI starts a conversation, asking for required details in sequence.
4.  **Exceptions**: If a candidate falls outside standard brackets, the operator provides a rationale to grant an exception.
5.  **Flagging**: If 3+ exceptions occur, the entry is visually flagged for review.
6.  **Confirm**: AI presents a summary card; user confirms the data is correct.
7.  **Submit**: Data is securely stored in Firestore, and the chat resets for the next registration.

---

## 🛡 Security & Privacy
*   **PII Protection**: Sensitive user data is protected by strict Firestore security rules.
*   **Admin Verification**: Administrative actions are restricted to a verified owner email.
*   **Data Integrity**: AI-driven validation prevents "garbage in, garbage out" scenarios.
