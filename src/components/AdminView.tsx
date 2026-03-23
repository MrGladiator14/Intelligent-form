import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  FileText, 
  Mail, 
  Database, 
  Type as TypeIcon, 
  Hash, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { FormDefinition, FormField } from '../types';

interface AdminViewProps {
  createNewForm: (title: string, description: string, fields: FormField[], allowedEmails: string[], flaggingThreshold: number) => Promise<void>;
  updateForm: (formId: string, title: string, description: string, fields: FormField[], allowedEmails: string[], flaggingThreshold: number) => Promise<void>;
  forms: FormDefinition[];
  deleteForm: (formId: string) => Promise<void>;
  setActiveForm: (form: FormDefinition) => void;
  setActiveTab: (tab: 'chat' | 'admin' | 'submissions') => void;
}

export function AdminView({ createNewForm, updateForm, forms, deleteForm, setActiveForm, setActiveTab }: AdminViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingForm, setEditingForm] = useState<FormDefinition | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allowedEmailsInput, setAllowedEmailsInput] = useState('');
  const [flaggingThreshold, setFlaggingThreshold] = useState(3);
  const [fields, setFields] = useState<FormField[]>([
    { id: 'field_1', label: 'Full Name', type: 'text', required: true }
  ]);

  useEffect(() => {
    if (editingForm) {
      setTitle(editingForm.title);
      setDescription(editingForm.description);
      setFields(editingForm.fields);
      setAllowedEmailsInput(editingForm.allowedEmails?.join(', ') || '');
      setFlaggingThreshold(editingForm.flaggingThreshold || 3);
      setIsCreating(true);
    }
  }, [editingForm]);

  const addField = () => {
    const newId = `field_${Date.now()}`;
    setFields([...fields, { id: newId, label: '', type: 'text', required: true }]);
  };

  const removeField = (id: string) => {
    if (fields.length > 1) {
      setFields(fields.filter(f => f.id !== id));
    }
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingForm(null);
    setTitle('');
    setDescription('');
    setAllowedEmailsInput('');
    setFields([{ id: 'field_1', label: 'Full Name', type: 'text', required: true }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || fields.some(f => !f.label.trim())) return;
    
    const allowedEmails = allowedEmailsInput
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (editingForm) {
      await updateForm(editingForm.id, title, description, fields, allowedEmails, flaggingThreshold);
    } else {
      await createNewForm(title, description, fields, allowedEmails, flaggingThreshold);
    }
    resetForm();
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Form Management</h2>
            <p className="text-slate-500">Create and manage dynamic AI-powered forms.</p>
          </div>
          {!isCreating && (
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus className="w-5 h-5" />
              New Form
            </button>
          )}
        </div>

        {isCreating ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Form Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Summer Camp Registration"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Collect details for the 2024 camp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Flagging Threshold (Exceptions)</label>
                  <input 
                    type="number" 
                    value={flaggingThreshold}
                    onChange={(e) => setFlaggingThreshold(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Auto-flag for review if exceptions reach this number.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  Allowed User Emails (Optional)
                </label>
                <input 
                  type="text" 
                  value={allowedEmailsInput}
                  onChange={(e) => setAllowedEmailsInput(e.target.value)}
                  placeholder="e.g. user1@example.com, user2@example.com (Leave empty for public access)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
                <p className="text-[10px] text-slate-400 font-medium">Comma-separated list of emails. If empty, any authenticated user can view this form.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Form Fields
                  </h3>
                  <button 
                    type="button"
                    onClick={addField}
                    className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-all"
                  >
                    + Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200">
                        {index + 1}
                      </span>
                      <input 
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Field Label (e.g. Date of Birth)"
                        className="flex-1 min-w-[150px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <select 
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="email">Email</option>
                        <option value="file">File/URL</option>
                      </select>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-medium text-slate-500">Required</span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  {editingForm ? 'Update Form' : 'Save Form'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form) => (
              <div key={form.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {form.fields.length} Fields
                    </span>
                    {form.allowedEmails && form.allowedEmails.length > 0 && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded uppercase tracking-tighter flex items-center gap-1">
                        <AlertCircle className="w-2 h-2" />
                        Restricted
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{form.title}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{form.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex -space-x-2">
                    {form.fields.slice(0, 3).map((f) => (
                      <div key={f.id} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center" title={f.label}>
                        {f.type === 'text' && <TypeIcon className="w-3 h-3 text-slate-400" />}
                        {f.type === 'number' && <Hash className="w-3 h-3 text-slate-400" />}
                        {f.type === 'date' && <Calendar className="w-3 h-3 text-slate-400" />}
                        {f.type === 'email' && <Mail className="w-3 h-3 text-slate-400" />}
                      </div>
                    ))}
                    {form.fields.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                        +{form.fields.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingForm(form)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                      title="Edit Form"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setActiveForm(form);
                        setActiveTab('chat');
                      }}
                      className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Use Form
                    </button>
                    <button 
                      onClick={() => deleteForm(form.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete Form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
