import React, { useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  X,
  CloudUpload,
  Brain,
  Tag,
} from 'lucide-react';

const CreateIncident = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('high');
  const [type, setType] = useState('api');
  const [assignee, setAssignee] = useState('Alex Chen');
  const [tags, setTags] = useState(['production', 'v1-api']);
  const [newTag, setNewTag] = useState('');
  const [notifyTeam, setNotifyTeam] = useState(true);
  const [runPlaybook, setRunPlaybook] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const severityOptions = [
    { id: 'critical', label: 'Critical', color: 'text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#93000a]/10' },
    { id: 'high', label: 'High', color: 'text-orange-500 border-orange-500/20 bg-orange-500/5' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' },
    { id: 'low', label: 'Low', color: 'text-blue-500 border-blue-500/20 bg-blue-500/5' },
  ];

  const typeOptions = [
    { id: 'api', label: 'API' },
    { id: 'server', label: 'Server' },
    { id: 'database', label: 'Database' },
    { id: 'security', label: 'Security' },
  ];

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`w-9 h-5 rounded-full relative flex items-center px-0.5 transition-all duration-200 ${
        enabled ? 'bg-[#528dff]' : 'bg-neutral-700'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className=" text-[#e2e2e3] min-h-screen w-full antialiased">
      <div className="flex h-screen">
        {/* Main Content */}
        <main className="flex-1 pt-12 pb-20 px-8 ">
          <div className="max-w-[720px] mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Create Incident
              </h1>
            </div>

            <form className="space-y-8">
              {/* Title */}
              <div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-[22px] font-semibold bg-transparent border-b border-neutral-800 pb-4 placeholder:text-neutral-600 focus:border-[#528dff] focus:outline-none"
                  placeholder="What happened? (e.g. API returning 500 errors)"
                  type="text"
                />
              </div>

              {/* Description */}
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-5 text-[15px] leading-relaxed placeholder:text-neutral-500 resize-none focus:border-[#528dff] focus:outline-none min-h-[160px]"
                  placeholder="Describe what's happening, symptoms, and impact..."
                  rows={7}
                />
                <button
                  type="button"
                  className="absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#528dff]" />
                  <span className="text-xs font-medium text-white">Generate with AI</span>
                </button>
              </div>

              {/* Quick Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Severity */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    Severity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {severityOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSeverity(opt.id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          severity === opt.id
                            ? opt.color
                            : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-sm focus:border-[#528dff] focus:outline-none cursor-pointer"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    Assignee
                  </label>
                  <div className="flex items-center gap-3 bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 hover:border-neutral-600 transition-colors cursor-pointer">
                    <img
                      alt="Avatar"
                      className="w-7 h-7 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYsRwF28g-CH48KW9sUazzdWe5HTc7ujyt2LF39AJheZzyo1iDg92SYrfGCm711D9zq7MwEeaYedgSozLaFZJC4I4EAmD-J9jVYfWCUaj2N_S7xLFUTqutcpNJSNJRTlYg2oTaH6xs7AU71t95gLLS16oS-EdLTjruCTlWuuYGlNY6p6c9zdtsG8BvTuQlid8B1cB_V8tHsWVCawWXcGIo4o_RHm6KsUbkDtQ_Wa6beMNSIb_shoAEFxdcj5RI40IR5h4bmLXz95en"
                    />
                    <span className="text-sm text-neutral-200">{assignee}</span>
                    <ChevronRight className="ml-auto w-4 h-4 text-neutral-500" />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  Tags
                </label>
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex flex-wrap gap-2 items-center min-h-[58px]">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <Tag className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleAddTag}
                    className="bg-transparent border-none p-1 text-sm flex-1 min-w-[140px] placeholder:text-neutral-600 focus:outline-none"
                    placeholder="Add tag... (press Enter)"
                    type="text"
                  />
                </div>
              </div>

              {/* AI Impact Analysis */}
              <div className="p-6 border-2 border-dashed border-neutral-700 rounded-2xl bg-neutral-900/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-11 h-11 rounded-xl bg-[#528dff]/10 flex items-center justify-center border border-[#528dff]/30 flex-shrink-0">
                    <Brain className="w-6 h-6 text-[#528dff]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">AI Impact Analysis</h4>
                    <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
                      Resolute AI will analyze this incident and suggest fixes, related logs, and playbooks.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-6 py-3 bg-[#528dff] hover:bg-[#4a7dff] text-[#00275f] font-semibold text-sm rounded-xl transition-all whitespace-nowrap"
                >
                  Analyze with AI
                </button>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Notify team", state: notifyTeam, setter: setNotifyTeam },
                  { label: "Run playbook", state: runPlaybook, setter: setRunPlaybook },
                  { label: "AI Suggestions", state: aiSuggestions, setter: setAiSuggestions },
                ].map(({ label, state, setter }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between bg-[#141414] border border-[#262626] rounded-xl p-5"
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <ToggleSwitch enabled={state} onChange={setter} />
                  </div>
                ))}
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  Attachments
                </label>
                <div className="border border-dashed border-neutral-700 hover:border-neutral-600 bg-[#141414] rounded-2xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
                    <CloudUpload className="w-7 h-7 text-neutral-400" />
                  </div>
                  <p className="text-neutral-300 font-medium text-center">
                    Drop logs, screenshots, or files here
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Max 25MB • PNG, JPG, TXT, LOG supported
                  </p>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="mt-16 flex items-center justify-end gap-4 pb-10">
              <button className="px-8 py-3 text-sm font-semibold text-neutral-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button className="px-10 py-3 bg-[#528dff] hover:brightness-110 text-[#00275f] font-semibold rounded-2xl shadow-lg shadow-blue-950/50 transition-all">
                Create Incident
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateIncident;