/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

// --- Hooks ---
import { useAuth } from './hooks/useAuth';
import { useForms } from './hooks/useForms';
import { useChat } from './hooks/useChat';

// --- Components ---
import { ChatView } from './components/ChatView';
import { AdminView } from './components/AdminView';
import { SubmissionsView } from './components/SubmissionsView';
import { SubmissionDetailsModal } from './components/SubmissionDetailsModal';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';

// --- Types ---
import { Submission } from './types';

export default function App() {
  const { user, isAdmin, isAuthReady, error: authError, handleLogin, handleLogout } = useAuth();
  const { 
    forms, activeForm, setActiveForm, submissions, error: formsError, 
    createNewForm, updateForm, deleteForm, updateStatus 
  } = useForms(user);
  
  const {
    messages, input, setInput, fileData, setFileData, isLoading, isSubmitted, setIsSubmitted,
    error: chatError, currentFieldIndex, handleFileChange, handleSendMessage, resetChat, chatEndRef
  } = useChat(user, activeForm);

  const [activeTab, setActiveTab] = useState<'chat' | 'admin' | 'submissions'>('chat');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionFilter, setSubmissionFilter] = useState<string>('all');

  const error = authError || formsError || chatError;

  if (!isAuthReady) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginView handleLogin={handleLogin} />;
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin} 
        user={user} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'chat' && (
          <ChatView 
            messages={messages} 
            isLoading={isLoading} 
            isSubmitted={isSubmitted} 
            error={error} 
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            chatEndRef={chatEndRef}
            setIsSubmitted={setIsSubmitted}
            activeForm={activeForm}
            forms={forms}
            setActiveForm={setActiveForm}
            handleFileChange={handleFileChange}
            fileData={fileData}
            setFileData={setFileData}
            currentFieldIndex={currentFieldIndex}
            resetChat={resetChat}
          />
        )}

        {activeTab === 'admin' && isAdmin && (
          <AdminView 
            createNewForm={createNewForm} 
            updateForm={updateForm}
            forms={forms} 
            deleteForm={deleteForm} 
            setActiveForm={setActiveForm}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'submissions' && isAdmin && (
          <SubmissionsView 
            submissions={submissions} 
            onViewDetails={(sub: Submission) => setSelectedSubmission(sub)} 
            forms={forms}
            filter={submissionFilter}
            setFilter={setSubmissionFilter}
          />
        )}
      </div>

      <SubmissionDetailsModal 
        selectedSubmission={selectedSubmission} 
        onClose={() => setSelectedSubmission(null)} 
        onUpdateStatus={async (id, status) => {
          await updateStatus(id, status);
          setSelectedSubmission(null);
        }}
      />
    </div>
  );
}
