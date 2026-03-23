import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Database, AlertCircle } from 'lucide-react';
import { Submission } from '../types';

interface SubmissionDetailsModalProps {
  selectedSubmission: Submission | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
}

export function SubmissionDetailsModal({ selectedSubmission, onClose, onUpdateStatus }: SubmissionDetailsModalProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
    if (!selectedSubmission) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedSubmission.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Submission Details</h3>
                <p className="text-sm text-slate-500">{selectedSubmission.formTitle}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Submitted By</span>
                  <p className="text-sm font-semibold text-slate-700">{selectedSubmission.userEmail}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date</span>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedSubmission.submittedAt?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {selectedSubmission.isFlagged && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Manager Review Required</p>
                      <p className="text-xs opacity-80 font-medium">This entry has 3+ exceptions and has been automatically flagged.</p>
                    </div>
                  </div>
                )}

                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  Collected Data
                </h4>
                <div className="grid gap-3">
                  {Object.entries(selectedSubmission.data).map(([key, value]) => (
                    <div key={key} className="p-4 border border-slate-100 rounded-2xl flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{key}</span>
                      <div className="text-slate-700 font-medium">
                        {typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:')) ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                            {value.startsWith('data:') ? 'View Uploaded File' : value}
                          </a>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSubmission.exceptions && selectedSubmission.exceptions.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Exceptions Granted ({selectedSubmission.exceptionCount})
                    </h4>
                    <div className="space-y-2">
                      {selectedSubmission.exceptions.map((ex, i) => (
                        <div key={i} className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                          <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">{ex.field}</p>
                          <p className="text-xs text-amber-800 font-medium">{ex.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {selectedSubmission.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate('accepted')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest ${
                    selectedSubmission.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
