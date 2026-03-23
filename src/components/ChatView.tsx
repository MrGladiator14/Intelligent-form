import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  User as UserIcon, 
  Bot, 
  FileText,
  Send,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, FormDefinition } from '../types';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  isSubmitted: boolean;
  error: string | null;
  input: string;
  setInput: (val: string) => void;
  handleSendMessage: (e?: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  setIsSubmitted: (val: boolean) => void;
  activeForm: FormDefinition | null;
  forms: FormDefinition[];
  setActiveForm: (form: FormDefinition) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileData: { name: string, data: string } | null;
  setFileData: (data: { name: string, data: string } | null) => void;
  currentFieldIndex: number;
  resetChat: () => void;
}

export function ChatView({ 
  messages, isLoading, isSubmitted, error, input, setInput, handleSendMessage, chatEndRef, setIsSubmitted, activeForm, forms, setActiveForm, handleFileChange, fileData, setFileData, currentFieldIndex, resetChat 
}: ChatViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input after bot response
  useEffect(() => {
    if (!isLoading && !isSubmitted && activeForm) {
      textInputRef.current?.focus();
    }
  }, [isLoading, isSubmitted, activeForm]);

  // Progress calculation
  const totalSteps = activeForm?.fields.length || 11;
  const progress = Math.min(((currentFieldIndex + 1) / totalSteps) * 100, 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Sticky Header Section for Progress and Form Selector */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
        {/* Progress Bar */}
        {activeForm && !isSubmitted && (
          <div className="px-4 py-3">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Registration Progress
                </span>
                <span className="text-xs font-bold text-indigo-600">
                  Step {Math.min(currentFieldIndex + 1, totalSteps)} of {totalSteps}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Selector (Admin only or if multiple) */}
        {forms.length > 1 && (
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Active Form:</span>
            {forms.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveForm(f);
                  setIsSubmitted(false);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeForm?.id === f.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 overflow-y-auto scroll-smooth">
        {!activeForm ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No active forms</h2>
            <p className="text-slate-500">Wait for an administrator to create a form.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isError = msg.text.toLowerCase().includes('invalid') || msg.text.toLowerCase().includes('reject');
                const isWarning = msg.text.toLowerCase().includes('outside the standard bracket') || msg.text.toLowerCase().includes('exception');
                const EXCEPTION_NOTE = "Note: This entry has 3+ exceptions and is flagged for Manager Review.";
                const hasExceptionNote = msg.text.includes(EXCEPTION_NOTE);
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                      msg.role === 'user' ? 'bg-indigo-600' : 'bg-white border border-slate-100'
                    }`}>
                      {msg.role === 'user' ? (
                        <UserIcon className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    
                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : isError 
                          ? 'bg-red-50 text-red-800 border border-red-100 rounded-tl-none'
                          : hasExceptionNote
                            ? 'bg-rose-50 text-slate-800 border border-rose-200 rounded-tl-none'
                            : isWarning
                              ? 'bg-amber-50 text-amber-800 border border-amber-100 rounded-tl-none'
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      <div className="markdown-body text-sm sm:text-base leading-relaxed font-medium">
                        {hasExceptionNote ? (
                          <>
                            <ReactMarkdown>{msg.text.split(EXCEPTION_NOTE)[0]}</ReactMarkdown>
                            <div className="my-3 p-3 bg-rose-100 border-l-4 border-rose-500 rounded-r-lg text-rose-900 font-bold text-xs flex items-center gap-2 animate-pulse">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>{EXCEPTION_NOTE}</span>
                            </div>
                            <ReactMarkdown>{msg.text.split(EXCEPTION_NOTE)[1] || ""}</ReactMarkdown>
                          </>
                        ) : (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        )}
                      </div>
                      <span className={`text-[9px] mt-2 block opacity-50 font-bold uppercase tracking-tighter ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}

            {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] text-center space-y-4 shadow-xl shadow-emerald-100/50"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">Registration Complete</h3>
                  <p className="text-emerald-700 font-medium">The candidate summary has been saved to the database.</p>
                </div>
                <button 
                  onClick={resetChat}
                  className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  New Registration
                </button>
              </motion.div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 p-4 pb-8 sm:pb-6">
        <div className="max-w-2xl mx-auto">
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-center gap-2"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.json,.xml"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-3.5 rounded-2xl transition-all ${
                fileData ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              title="Upload document"
            >
              <Plus className={`w-6 h-6 ${fileData ? 'rotate-45' : ''}`} />
            </button>

            <div className="flex-1 relative">
              <input 
                type="text"
                ref={textInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSubmitted ? "Registration completed" : "Type candidate response..."}
                disabled={isLoading || isSubmitted || !activeForm}
                className="w-full py-4 pl-6 pr-14 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-50 font-medium"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading || isSubmitted || !activeForm}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>
          {fileData && (
            <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700 truncate max-w-[200px]">{fileData.name}</span>
              <button 
                onClick={() => {
                  setFileData(null);
                  setInput('');
                }}
                className="ml-auto p-1 hover:bg-indigo-100 rounded-full"
              >
                <Plus className="w-4 h-4 rotate-45 text-indigo-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
