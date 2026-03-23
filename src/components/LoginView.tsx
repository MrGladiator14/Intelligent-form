import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';

interface LoginViewProps {
  handleLogin: () => void;
}

export function LoginView({ handleLogin }: LoginViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">EduStream Admissions</h1>
        <p className="text-slate-600 mb-8">Welcome to the future of school admissions. Sign in to start your conversational application.</p>
        <button 
          onClick={handleLogin}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}
