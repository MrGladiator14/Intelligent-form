import React from 'react';
import { 
  GraduationCap, 
  MessageSquare, 
  Settings, 
  Database, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'chat' | 'admin' | 'submissions';
  setActiveTab: (tab: 'chat' | 'admin' | 'submissions') => void;
  isAdmin: boolean;
  user: User;
  handleLogout: () => void;
}

export function Header({ activeTab, setActiveTab, isAdmin, user, handleLogout }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-slate-900 leading-none">EduStream</h1>
            <span className="text-xs text-slate-500 font-medium">Smart Admissions</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'chat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          {isAdmin && (
            <>
              <button 
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                Forms
              </button>
              <button 
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'submissions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Database className="w-4 h-4" />
                Data
              </button>
            </>
          )}
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
            {user.photoURL ? (
              <img src={user.photoURL} className="w-6 h-6 rounded-full" alt={user.displayName || ''} />
            ) : (
              <UserIcon className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-sm font-medium text-slate-700">{user.displayName?.split(' ')[0]}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
