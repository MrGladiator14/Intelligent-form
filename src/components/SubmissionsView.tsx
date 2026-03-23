import React from 'react';
import { 
  User as UserIcon, 
  Database, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Submission, FormDefinition } from '../types';

interface SubmissionsViewProps {
  submissions: Submission[];
  onViewDetails: (sub: Submission) => void;
  forms: FormDefinition[];
  filter: string;
  setFilter: (filter: string) => void;
}

export function SubmissionsView({ submissions, onViewDetails, forms, filter, setFilter }: SubmissionsViewProps) {
  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter((s) => s.formId === filter);

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Form Submissions</h2>
            <p className="text-slate-500">Review all data collected by your AI assistants.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-400 px-2 uppercase">Filter:</span>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm font-semibold text-slate-600 bg-transparent outline-none pr-4"
            >
              <option value="all">All Forms</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Form</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Data Preview</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubmissions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    onClick={() => onViewDetails(sub)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          sub.isFlagged ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {sub.userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{sub.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">
                        {sub.formTitle || 'General Form'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                          sub.exceptionCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {sub.exceptionCount || 0} Exceptions
                        </span>
                        {sub.isFlagged && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-tighter flex items-center gap-1">
                            <AlertCircle className="w-2 h-2" />
                            Flagged
                          </span>
                        )}
                        {sub.status !== 'pending' && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter ${
                            sub.status === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {sub.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">
                        {sub.submittedAt?.toDate().toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {submissions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No submissions yet</h3>
              <p className="text-slate-500">Data will appear here once users complete forms.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
