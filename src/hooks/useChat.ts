import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { GenerateContentResponse } from "@google/genai";
import { db, auth } from '../firebase';
import { 
  Message, 
  FormDefinition, 
} from '../types';
import { 
  saveSubmission, 
} from '../services/firebaseService';
import { createChatSession, prepareMessageContent } from '../services/aiService';

export function useChat(user: User | null, activeForm: FormDefinition | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [fileData, setFileData] = useState<{ name: string, data: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [exceptionCount, setExceptionCount] = useState(0);
  const [currentExceptions, setCurrentExceptions] = useState<{field: string, rationale: string}[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  // Persistence: Load state
  useEffect(() => {
    if (user && activeForm) {
      const saved = localStorage.getItem(`chat_state_${activeForm.id}_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
          setCurrentFieldIndex(parsed.currentFieldIndex || 0);
          setExceptionCount(parsed.exceptionCount || 0);
          setCurrentExceptions(parsed.currentExceptions || []);
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }
    }
  }, [user, activeForm]);

  // Persistence: Save state
  useEffect(() => {
    if (user && activeForm && messages.length > 0) {
      const state = {
        messages,
        currentFieldIndex,
        exceptionCount,
        currentExceptions
      };
      localStorage.setItem(`chat_state_${activeForm.id}_${user.uid}`, JSON.stringify(state));
    }
  }, [messages, user, activeForm, currentFieldIndex, exceptionCount, currentExceptions]);

  useEffect(() => {
    if (activeForm) {
      setCurrentFieldIndex(0);
      setMessages([]);
      setIsSubmitted(false);
      setExceptionCount(0);
      setCurrentExceptions([]);
      startChat(activeForm);
    }
  }, [activeForm]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = (form: FormDefinition) => {
    const chat = createChatSession(form);
    chatSessionRef.current = chat;

    // Initial greeting
    const greetingText = `Hello! I'm here to help you fill out the "${form.title}" form. ${form.description} \n\nTo start, could you provide the ${form.fields[0].label}?`;
    const parts = greetingText.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    setMessages(parts.map((p, i) => ({
      id: `initial-${i}`,
      role: 'model' as 'model',
      text: p.trim(),
      timestamp: new Date()
    })));
  };

  const resetChat = () => {
    if (activeForm && user) {
      localStorage.removeItem(`chat_state_${activeForm.id}_${user.uid}`);
      setCurrentFieldIndex(0);
      setExceptionCount(0);
      setCurrentExceptions([]);
      setMessages([]);
      setIsSubmitted(false);
      startChat(activeForm);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError("File too large. Please upload a file smaller than 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFileData({ name: file.name, data: base64 });
      setInput(`Uploaded file: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isSubmitted || !activeForm) return;

    // --- Strict Validation Layer ---
    const currentField = activeForm.fields[currentFieldIndex];

    if (currentField?.validation?.regex) {
      const regex = new RegExp(currentField.validation.regex);
      if (!regex.test(input)) {
        const errorMsg = currentField.validation.errorMessage || "Invalid input format.";
        setMessages(prev => [...prev, 
          { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() },
          { id: (Date.now() + 1).toString(), role: 'model', text: `Strict Validation Error: ${errorMsg} Please try again.`, timestamp: new Date() }
        ]);
        setInput('');
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setFileData(null);
    setIsLoading(true);
    setError(null);

    try {
      const messageContent = prepareMessageContent(input, fileData);
      const result = await chatSessionRef.current.sendMessage({ message: messageContent });
      const response: GenerateContentResponse = result;
      const text = response.text || "";

      const functionCalls = response.functionCalls;
      let shouldIncrement = false;

      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'grantException') {
            const { field, rationale } = call.args as any;
            setExceptionCount(prev => prev + 1);
            setCurrentExceptions(prev => [...prev, { field, rationale }]);
            
            const followUp = await chatSessionRef.current.sendMessage({
              message: `Exception granted for ${field}. Please proceed to the next field.`
            });
            
            const followUpText = followUp.text || `Exception granted for ${field}.`;
            const parts = followUpText.split(/\n\n+/).filter(p => p.trim().length > 0);
            
            setMessages(prev => [
              ...prev, 
              ...parts.map((p, i) => ({
                id: `followup-${Date.now()}-${i}`,
                role: 'model' as 'model',
                text: p.trim(),
                timestamp: new Date()
              }))
            ]);

            shouldIncrement = true;
          }

          if (call.name === 'submitForm') {
            await saveSubmission(db, user, activeForm, call.args, auth, currentExceptions);
            
            const followUp = await chatSessionRef.current.sendMessage({
              message: "The form has been successfully submitted. Please confirm this to the user and thank them."
            });
            
            const followUpText = followUp.text || "Thank you! Your submission has been received.";
            const parts = followUpText.split(/\n\n+/).filter(p => p.trim().length > 0);
            
            setMessages(prev => [
              ...prev, 
              ...parts.map((p, i) => ({
                id: `submit-${Date.now()}-${i}`,
                role: 'model' as 'model',
                text: p.trim(),
                timestamp: new Date()
              }))
            ]);
            
            setIsSubmitted(true);
            localStorage.removeItem(`chat_state_${activeForm.id}_${user.uid}`);
            shouldIncrement = false;
          }
        }
      } else {
        const lowerText = text.toLowerCase();
        const isRejection = lowerText.includes('invalid') || 
                           lowerText.includes('please try again') || 
                           lowerText.includes('incorrect') ||
                           lowerText.includes('does not match') ||
                           lowerText.includes('cannot') ||
                           lowerText.includes('blocked');
        
        const isExceptionPrompt = (lowerText.includes('exception') || lowerText.includes('rationale')) && 
                                  !lowerText.includes('granted') && 
                                  !lowerText.includes('recorded') &&
                                  !lowerText.includes('processed') &&
                                  !lowerText.includes('received');
        
        if (!isRejection && (!isExceptionPrompt || !currentField?.validation?.isSoftRule)) {
          // Only increment if the bot is actually moving to a new field
          // We check if the bot mentions the next field's label
          const nextField = activeForm.fields[currentFieldIndex + 1];
          const mentionsNextField = nextField && lowerText.includes(nextField.label.toLowerCase());
          const mentionsCurrentField = lowerText.includes(currentField.label.toLowerCase());
          
          if (mentionsNextField || (!mentionsCurrentField && !isExceptionPrompt)) {
            shouldIncrement = true;
          }
        }

        const parts = (text || "I'm sorry, I didn't quite get that.").split(/\n\n+/).filter(p => p.trim().length > 0);

        setMessages(prev => [
          ...prev, 
          ...parts.map((p, i) => ({
            id: `model-${Date.now()}-${i}`,
            role: 'model' as 'model',
            text: p.trim(),
            timestamp: new Date()
          }))
        ]);
      }

      if (shouldIncrement && !isSubmitted) {
        setCurrentFieldIndex(prev => Math.min(prev + 1, activeForm.fields.length));
      }
    } catch (err) {
      console.error("Gemini Error:", err);
      setError("Something went wrong with the conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    fileData,
    setFileData,
    isLoading,
    isSubmitted,
    setIsSubmitted,
    error,
    currentFieldIndex,
    handleFileChange,
    handleSendMessage,
    resetChat,
    chatEndRef
  };
}
