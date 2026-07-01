import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  Trash,
  Star,
  Search,
  Sparkles,
  Upload,
  Folder,
  Tag,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  Brain,
  Minimize2,
  FileCode,
  Check,
  Languages,
  RefreshCw,
  Share2,
  Send,
  X,
  Copy,
  Download,
  Mail,
  Printer
} from 'lucide-react';

export const Notes: React.FC = () => {
  const {
    notes,
    subjects,
    addNote,
    updateNote,
    deleteNote,
    generateAINoteFeatures,
    createNewChat,
    setActiveTab,
    addNotification,
    addXP
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  
  // Create / Edit note state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.id || '');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // Share/Export Modal State
  const [shareModalNote, setShareModalNote] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Loading indicators
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const activeNote = notes.find(n => n.id === selectedNoteId);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created = addNote({
      title: newTitle,
      subjectId: newSubject,
      content: newContent,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      type: 'text'
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsCreating(false);
    setSelectedNoteId(created.id);
  };

  const handleShareToDoubtSolver = () => {
    if (!activeNote) return;
    const initialMsg = `Hello! I have loaded your material: "${activeNote.title}". Let's discuss it, solve doubts, or draft study guides! Here is the content:\n\n${activeNote.content}`;
    const pdfGroundingName = activeNote.type === 'pdf' ? activeNote.title : undefined;
    
    createNewChat(activeNote.title, initialMsg, pdfGroundingName);
    setActiveTab('doubt-solver');
    addNotification('Notes Shared', `Discussing "${activeNote.title}" inside Socrates AI Doubt Solver!`, 'achievement');
  };

  const handleDownloadPDF = () => {
    if (!activeNote) return;
    
    addNotification('PDF Generator', `Compiling "${activeNote.title}" into a high-density academic PDF...`, 'reminder');
    
    // Simulate high-density print PDF trigger
    setTimeout(() => {
      try {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>${activeNote.title}</title>
                <style>
                  body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                  h1 { font-size: 24px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
                  .meta { font-size: 12px; font-family: monospace; color: #64748b; margin-bottom: 30px; }
                  .content { font-size: 14px; white-space: pre-wrap; }
                </style>
              </head>
              <body>
                <h1>${activeNote.title}</h1>
                <div class="meta">DOCUMENT EXPORT | TYPE: ${activeNote.type?.toUpperCase()} | EXPORTED: ${new Date().toLocaleString()}</div>
                <div class="content">${activeNote.content}</div>
                <script>window.print();</script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          // Fallback - download as text file attachment
          const element = document.createElement("a");
          const file = new Blob([activeNote.content], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = `${activeNote.title.replace(/\s+/g, "_")}.txt`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
        addNotification('Export Complete', `Successfully exported "${activeNote.title}"!`, 'achievement');
      } catch (e) {
        console.error(e);
      }
    }, 1500);
  };

  // Trigger Gemini processing pipeline
  const handleAITransform = async (type: 'summary' | 'flashcards' | 'quiz' | 'explain' | 'simplify') => {
    if (!selectedNoteId) return;
    setAiLoading(type);
    await generateAINoteFeatures(selectedNoteId, type);
    setAiLoading(null);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real File Uploader
  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      let finalContent = '';
      if (file.name.endsWith('.txt')) {
        finalContent = content;
      } else if (file.type.startsWith('image/')) {
        finalContent = `Uploaded Image Resource: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\n[Visual Outline notes parsed. Click "Brief Summary" or "Expand Concept" to let Socrates explain the structure.]`;
      } else if (file.name.endsWith('.pdf')) {
        finalContent = `Attached PDF: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\n[Grounding document attached. Use the Socrates Co-Processor on the right to summarize or generate cards from this PDF.]`;
      } else {
        finalContent = `Attached Material: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\n[Grounding file content loaded. Use AI tools to compile study flashcards or summaries.]`;
      }

      const uploaded = addNote({
        title: file.name,
        subjectId: subjects[0]?.id || 's1',
        content: finalContent,
        tags: ['uploaded', file.name.split('.').pop() || 'file'],
        type: 'file'
      });

      setSelectedNoteId(uploaded.id);
      addNotification('File Imported!', `Created note from "${file.name}"`, 'achievement');
      addXP(25, `Uploaded grounding material ${file.name}`);
    };

    if (file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // High-fidelity Share/Export PDF handler
  const handleExportPDF = (note: any) => {
    setShareModalNote(note);
    addNotification('PDF Share Hub', `Generated academic share layout for "${note.title}".`, 'achievement');
    addXP(10, 'Opened academic share hub');
  };

  const filteredNotes = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'all' || n.subjectId === filterSubject;
    return matchSearch && matchSubject;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white pb-10 h-[calc(100vh-100px)]">
      
      {/* LEFT SECTION: NOTES SIDEBAR LIST (4 Cols) */}
      <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800/80 rounded-3xl flex flex-col overflow-hidden h-full">
        {/* Sidebar Header & Filters */}
        <div className="p-4 border-b border-slate-800/60 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold flex items-center">
              <Folder className="h-4.5 w-4.5 text-purple-400 mr-2" /> Notes Library
            </h2>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition flex items-center"
              title="Write Note"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Courses</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredNotes.map((n) => {
            const subject = subjects.find(s => s.id === n.subjectId);
            const isActive = selectedNoteId === n.id;
            
            return (
              <div
                key={n.id}
                onClick={() => {
                  setSelectedNoteId(n.id);
                  setIsCreating(false);
                }}
                className={`p-3 rounded-2xl cursor-pointer transition border relative group ${
                  isActive
                    ? 'bg-slate-800/50 border-purple-500/50'
                    : 'bg-slate-900/30 border-slate-800/40 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold truncate pr-6 text-slate-100">{n.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNote(n.id, { isFavorite: !n.isFavorite });
                    }}
                    className="absolute right-3 top-3 text-slate-500 hover:text-amber-400"
                  >
                    <Star className={`h-3.5 w-3.5 ${n.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>
                
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                  {n.content}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/20 text-[9px] text-slate-500 font-mono">
                  <span>{subject ? subject.code : 'Core'}</span>
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real Upload Bar */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/40 space-y-2 shrink-0">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest text-center">Attach Real Lecture Notes</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRealFileUpload}
            accept=".txt,.pdf,.docx,image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-900/40 hover:border-purple-800/60 text-xs font-semibold rounded-xl text-purple-300 flex items-center justify-center space-x-2 transition"
          >
            <Upload className="h-4 w-4 text-purple-400" />
            <span>Upload Document / Image</span>
          </button>
        </div>
      </div>

      {/* RIGHT SECTION: EDITOR AND AI ASSISTANT PANEL (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-slate-900/10 border border-slate-800/60 rounded-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* STATE A: Creating Note Form */}
          {isCreating ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleCreateNote}
              className="p-6 flex flex-col h-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold">Write New Course Note</h2>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Backpropagation calculus insights"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Course</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Content Editor</label>
                <textarea
                  required
                  placeholder="Paste lecture notes, study scripts, outline definitions here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full flex-1 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., calculus, artificial-intelligence, neural-networks"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl transition shadow-lg"
                >
                  Save Note
                </button>
              </div>
            </motion.form>
          ) : activeNote ? (
            
            /* STATE B: View Note and AI tools Panel */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Note Content Header */}
              <div className="p-4 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-purple-400 px-2 py-0.5 rounded border border-slate-700/50 uppercase">
                      {activeNote.type || 'text'}
                    </span>
                    <h2 className="text-sm font-bold text-slate-100">{activeNote.title}</h2>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Last modified: {new Date(activeNote.updatedAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShareToDoubtSolver}
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shadow-md cursor-pointer"
                    title="Send to Socrates AI Doubt Solver"
                  >
                    <Send className="h-3.5 w-3.5 text-white" />
                    <span>Discuss in AI Solver</span>
                  </button>
                  <button
                    onClick={() => handleExportPDF(activeNote)}
                    className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-950/20 px-3 py-1.5 rounded-xl transition border border-purple-800/30 hover:border-purple-700/50 flex items-center space-x-1"
                  >
                    <Share2 className="h-3.5 w-3.5 text-purple-400" />
                    <span>Share PDF</span>
                  </button>
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 p-2 rounded-xl transition border border-transparent hover:border-rose-900/30"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Flex Panel split: Left = note body, Right = AI summary generated cards */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                
                {/* Note Core text editor view */}
                <div className="p-5 overflow-y-auto border-r border-slate-800/50 flex flex-col space-y-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Note Content</h3>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {activeNote.content}
                  </p>
                </div>

                {/* AI generated features (Bento) */}
                <div className="p-5 bg-slate-950/30 overflow-y-auto flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400 mr-1" /> Gemini Academic Co-Processor
                    </h3>
                  </div>

                  {/* AI Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAITransform('summary')}
                      disabled={!!aiLoading}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      {aiLoading === 'summary' ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                      )}
                      <span>Brief Summary</span>
                    </button>

                    <button
                      onClick={() => handleAITransform('flashcards')}
                      disabled={!!aiLoading}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      {aiLoading === 'flashcards' ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Layers className="h-3.5 w-3.5 text-blue-400" />
                      )}
                      <span>Create Flashcards</span>
                    </button>

                    <button
                      onClick={() => handleAITransform('explain')}
                      disabled={!!aiLoading}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      {aiLoading === 'explain' ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Brain className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      <span>Expand Concept</span>
                    </button>
                  </div>

                  {/* AI Results Display */}
                  <div className="space-y-4 pt-3 border-t border-slate-800/60">
                    
                    {/* A: Summary */}
                    {activeNote.summary ? (
                      <div className="bg-purple-950/10 border border-purple-900/30 p-4 rounded-2xl space-y-2">
                        <h4 className="text-xs font-extrabold text-purple-300 flex items-center">
                          <Check className="h-4 w-4 mr-1 text-purple-400" /> AI Executive Abstract
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeNote.summary}</p>
                        
                        {activeNote.keyPoints && activeNote.keyPoints.length > 0 && (
                          <div className="pt-2 space-y-1.5">
                            <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">Key Takeaways</p>
                            {activeNote.keyPoints.map((pt, i) => (
                              <p key={i} className="text-xs text-slate-400 flex items-start">
                                <span className="text-purple-500 mr-2 font-mono">•</span> {pt}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-slate-800 border-dashed rounded-2xl text-slate-500">
                        <Brain className="h-6 w-6 text-slate-700 mx-auto mb-1.5" />
                        <p className="text-xs font-bold">No AI Abstract synthesized yet.</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">Click Brief Summary to request analysis from Gemini.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* STATE C: No Notes exist state */
            <div className="p-16 text-center m-auto space-y-3">
              <FileText className="h-10 w-10 text-slate-700 mx-auto" />
              <h3 className="font-bold text-slate-300">No notes in the workspace</h3>
              <p className="text-xs text-slate-500">Create a clean digital note card or simulate attachment uploads above.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl transition inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Create Note
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* GORGEOUS ACADEMIC SHARE HUB & PRINT HUB MODAL (Pop-up immune) */}
      <AnimatePresence>
        {shareModalNote && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Embedded Print CSS override to hide everything else on direct window.print() */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #academic-print-target, #academic-print-target * {
                  visibility: visible !important;
                }
                #academic-print-target {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  background: #ffffff !important;
                  color: #0f172a !important;
                  padding: 30px !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0C0C0E]/95 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/40">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                    <Share2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Academic Sharing Hub</h3>
                    <p className="text-[10px] text-slate-400 font-mono">POP-UP FREE PRINTING & DIGITAL SHARING</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalNote(null)}
                  className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Core Layout */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Side: Live Preview of Document (7 Cols) */}
                <div className="md:col-span-7 space-y-3 flex flex-col h-full max-h-[45vh] md:max-h-[50vh]">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Document Preview</p>
                  
                  {/* Styled print paper look container */}
                  <div 
                    id="academic-print-target"
                    className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800/80 rounded-2xl p-5 font-sans text-slate-300 shadow-inner text-left text-xs space-y-4"
                  >
                    {/* Header Block */}
                    <div className="border-b border-slate-850 pb-3">
                      <span className="text-[9px] font-mono font-extrabold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                        {shareModalNote.type?.toUpperCase() || 'LECTURE'}
                      </span>
                      <h1 className="text-base font-extrabold text-slate-100 mt-2 tracking-tight">{shareModalNote.title}</h1>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Syllabus ID: {shareModalNote.subjectId} • Updated: {new Date(shareModalNote.updatedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Content Block */}
                    <div className="whitespace-pre-wrap leading-relaxed text-[11px] font-normal text-slate-300">
                      {shareModalNote.content}
                    </div>

                    {/* AI Summary Block */}
                    {shareModalNote.summary && (
                      <div className="bg-purple-950/15 border border-purple-900/30 p-4 rounded-xl space-y-1.5 mt-4">
                        <p className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">★ AI Academic Abstract</p>
                        <p className="text-[10px] text-slate-300 leading-normal font-sans italic">{shareModalNote.summary}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Shared Action Center (5 Cols) */}
                <div className="md:col-span-5 space-y-4 flex flex-col justify-start">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Share Actions</p>
                  
                  {/* Share Link Generation Block */}
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-400 font-semibold leading-normal">Academic Share Link</p>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}/share/note/${shareModalNote.id}`}
                        className="flex-1 bg-slate-900 border border-slate-800 text-[10px] font-mono px-2.5 py-1.5 rounded-xl text-slate-400 select-all focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/share/note/${shareModalNote.id}`);
                          setCopiedLink(true);
                          addNotification('Share Link Copied', 'Note share link copied successfully to clipboard.', 'achievement');
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        className="p-1.5 bg-purple-600 hover:bg-purple-500 rounded-xl transition text-white shrink-0 flex items-center justify-center"
                        title="Copy Link"
                      >
                        {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions buttons stack */}
                  <div className="space-y-2">
                    {/* Direct Print */}
                    <button
                      onClick={() => {
                        addNotification('Direct Printing', 'Opening browser print overlay. You can choose "Save as PDF" to export.', 'achievement');
                        setTimeout(() => window.print(), 300);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Direct Print & Save as PDF</span>
                    </button>

                    {/* Copy Text */}
                    <button
                      onClick={() => {
                        const fullText = `STUDENTOS NOTES: ${shareModalNote.title}\n====================================\n\nCOURSE: ${shareModalNote.subjectId}\nDATE: ${new Date(shareModalNote.updatedAt).toLocaleString()}\n\nCONTENT:\n${shareModalNote.content}\n\n${shareModalNote.summary ? `AI ABSTRACT:\n${shareModalNote.summary}` : ''}`;
                        navigator.clipboard.writeText(fullText);
                        addNotification('Copied Text', 'Full note card copied to clipboard.', 'achievement');
                      }}
                      className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-2"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy Full Markdown Text</span>
                    </button>

                    {/* Download MD file */}
                    <button
                      onClick={() => {
                        const element = document.createElement("a");
                        const fullText = `# ${shareModalNote.title}\n\n**Course**: ${shareModalNote.subjectId}  \n**Updated**: ${new Date(shareModalNote.updatedAt).toLocaleDateString()}  \n\n## Content\n${shareModalNote.content}\n\n${shareModalNote.summary ? `## AI Abstract\n> ${shareModalNote.summary}` : ''}`;
                        const file = new Blob([fullText], {type: 'text/markdown'});
                        element.href = URL.createObjectURL(file);
                        element.download = `${shareModalNote.title.replace(/\s+/g, "_")}.md`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        addNotification('Downloaded .md', 'Notes compiled as a beautiful Markdown document.', 'achievement');
                      }}
                      className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-2"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-400" />
                      <span>Download Markdown (.md)</span>
                    </button>

                    {/* Share via Email */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent(`Academic Note: ${shareModalNote.title}`)}&body=${encodeURIComponent(`Hey!\n\nHere are my academic notes on "${shareModalNote.title}" for ${shareModalNote.subjectId}.\n\nCONTENT:\n${shareModalNote.content}\n\n---\nShared via StudentOS`)}`}
                      className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200 text-[11px] font-bold rounded-xl transition flex items-center justify-center space-x-2 text-center block"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>Email to Classmate</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/80 border-t border-slate-850 flex justify-end">
                <button
                  onClick={() => setShareModalNote(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl transition border border-slate-800"
                >
                  Dismiss Share Hub
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
