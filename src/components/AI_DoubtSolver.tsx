import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { MarkdownFormatter } from './MarkdownFormatter';
import {
  MessageSquare,
  Plus,
  Trash,
  Send,
  Image,
  FileText,
  Mic,
  Copy,
  Download,
  Terminal,
  Sparkles,
  Search,
  BookOpen,
  Info,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const AIDoubtSolver: React.FC = () => {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    sendMessageToChat,
    deleteChat
  } = useApp();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Real Uploads Attachment Status & Refs
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const [selectedPdfBase64, setSelectedPdfBase64] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage && !selectedPdfName) return;
    if (!activeChatId) return;

    const textToSend = input;
    const imgToSend = selectedImage || undefined;
    const pdfToSend = selectedPdfName || undefined;
    const pdfBase64ToSend = selectedPdfBase64 || undefined;

    setInput('');
    setSelectedImage(null);
    setSelectedPdfName(null);
    setSelectedPdfBase64(null);
    setIsSending(true);

    await sendMessageToChat(activeChatId, textToSend, imgToSend, pdfToSend, pdfBase64ToSend);
    
    setIsSending(false);
  };

  const handleCreateNewChat = () => {
    createNewChat();
  };

  // Real upload action triggers
  const handleRealImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setSelectedImage(base64Data);
      setSelectedPdfName(null);
      setSelectedPdfBase64(null);
      addToast(`Image "${file.name}" attached successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRealPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setSelectedPdfName(file.name);
      setSelectedPdfBase64(base64Data);
      setSelectedImage(null);
      addToast(`PDF "${file.name}" attached successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const triggerMockVoiceSolver = () => {
    setVoiceRecording(true);
    addToast('Recording voice note question...');
    setTimeout(() => {
      setVoiceRecording(false);
      setInput('Explain the physical intuition behind backpropagation in multi-layer perceptrons, specifically how errors travel backwards.');
      addToast('Transcription loaded successfully.');
    }, 2500);
  };

  // Toast notifier helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const addToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportChat = () => {
    if (!activeChat) return;
    const jsonStr = JSON.stringify(activeChat, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.title.replace(/\s+/g, '_')}_chat_export.json`;
    a.click();
    addToast('Chat exported successfully!');
  };

  const handleCopyChatResponse = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(chatSearch.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white pb-10 h-[calc(100vh-100px)] relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-slate-900 border border-purple-500 text-purple-200 text-xs py-2.5 px-4 rounded-xl shadow-2xl z-50 flex items-center"
          >
            <Sparkles className="h-4 w-4 text-purple-400 mr-2" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SECTION: CHATS HISTORY LIST (4 Cols) */}
      <div className="lg:col-span-4 bg-slate-900/30 border border-slate-800/80 rounded-3xl flex flex-col overflow-hidden h-full">
        {/* Search & Add chat button */}
        <div className="p-4 border-b border-slate-800/60 space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold flex items-center">
              <MessageSquare className="h-4.5 w-4.5 text-purple-400 mr-2" /> Socrates-OS Chat
            </h2>
            <button
              onClick={handleCreateNewChat}
              className="p-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition flex items-center"
              title="New Doubt Session"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter doubts history..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* History of sessions */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {filteredChats.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No session logs found</p>
          ) : (
            filteredChats.map((c) => {
              const isActive = activeChatId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  className={`p-3 rounded-2xl cursor-pointer border flex justify-between items-center transition relative group ${
                    isActive
                      ? 'bg-slate-800/50 border-purple-500/40 text-slate-100'
                      : 'bg-slate-900/20 border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <MessageSquare className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-xs font-semibold truncate pr-2">{c.title}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950/40 text-rose-400 transition"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SECTION: ACTIVE CHAT PANEL (8 Cols) */}
      <div className="lg:col-span-8 bg-slate-900/10 border border-slate-800/60 rounded-3xl flex flex-col overflow-hidden h-full">
        {activeChat ? (
          <>
            {/* Header bar of conversation */}
            <div className="p-4 border-b border-slate-800/60 bg-slate-950/40 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-500/10 border border-purple-500/20 p-1.5 rounded-lg text-purple-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 truncate max-w-sm md:max-w-md">{activeChat.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Socrates Engine: gemini-3.5-flash calibrated</p>
                </div>
              </div>

              <button
                onClick={handleExportChat}
                className="flex items-center space-x-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs border border-slate-800 transition text-slate-300"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Chat</span>
              </button>
            </div>

            {/* Conversation Flow viewport */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages.map((m, i) => {
                const isAI = m.sender === 'ai';
                return (
                  <div
                    key={i}
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'} items-start space-x-3 max-w-3xl ${
                      !isAI ? 'ml-auto' : ''
                    }`}
                  >
                    {isAI && (
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-[10px] font-bold">
                        AI
                      </div>
                    )}

                    <div
                      className={`p-3.5 px-4 rounded-2xl relative border group ${
                        isAI
                          ? 'bg-slate-900/60 border-slate-800/80 rounded-tl-none'
                          : 'bg-purple-950/35 border-purple-900/50 rounded-tr-none text-slate-100'
                      }`}
                    >
                      {/* Upload attachments within user dialog */}
                      {m.image && (
                        <div className="mb-2 p-2 bg-slate-950 border border-slate-800 rounded-xl max-w-xs">
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                            <Image className="h-3.5 w-3.5 text-blue-400" />
                            <span>whiteboard_math_problem.png</span>
                          </div>
                        </div>
                      )}

                      {m.pdfName && (
                        <div className="mb-2 p-2 bg-slate-950 border border-slate-800 rounded-xl max-w-xs">
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                            <FileText className="h-3.5 w-3.5 text-rose-400" />
                            <span>{m.pdfName}</span>
                          </div>
                        </div>
                      )}

                      {/* Content parsing */}
                      {isAI ? (
                        m.content === 'Thinking...' ? (
                          <div className="flex items-center space-x-2 py-1 text-slate-400">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-400" />
                            <span className="text-xs font-mono">Formulating logical steps...</span>
                          </div>
                        ) : (
                          <MarkdownFormatter content={m.content} />
                        )
                      ) : (
                        <p className="text-xs md:text-sm whitespace-pre-wrap">{m.content}</p>
                      )}

                      {/* Micro-actions inside AI blocks */}
                      {isAI && m.content !== 'Thinking...' && (
                        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
                          <button
                            onClick={() => handleCopyChatResponse(m.content, i)}
                            className="p-1 hover:text-white text-slate-500 transition"
                            title="Copy Response"
                          >
                            {copiedId === i ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar Form with Attachments buttons */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3 shrink-0">
              {/* Grounded items drawer if active */}
              {(selectedImage || selectedPdfName) && (
                <div className="flex flex-wrap gap-2.5 p-2 bg-slate-900 rounded-xl border border-slate-800">
                  {selectedImage && (
                    <div className="flex items-center space-x-2 px-2.5 py-1 bg-slate-950 rounded-lg text-[10px]">
                      <Image className="h-3.5 w-3.5 text-blue-400" />
                      <span>Math Problem Diagram Attached</span>
                      <button onClick={() => setSelectedImage(null)} className="text-slate-500 hover:text-white font-bold ml-1.5">×</button>
                    </div>
                  )}

                  {selectedPdfName && (
                    <div className="flex items-center space-x-2 px-2.5 py-1 bg-slate-950 rounded-lg text-[10px]">
                      <FileText className="h-3.5 w-3.5 text-rose-400" />
                      <span>{selectedPdfName}</span>
                      <button onClick={() => { setSelectedPdfName(null); setSelectedPdfBase64(null); }} className="text-slate-500 hover:text-white font-bold ml-1.5">×</button>
                    </div>
                  )}
                </div>
              )}

              <input
                type="file"
                ref={imageInputRef}
                onChange={handleRealImageUpload}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={pdfInputRef}
                onChange={handleRealPdfUpload}
                accept=".pdf"
                className="hidden"
              />

              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={voiceRecording ? 'Recording and transcribing query...' : 'Solve math formulas, programming files, homework issues...'}
                    value={input}
                    disabled={voiceRecording}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 pl-4 pr-24 py-3 rounded-2xl text-xs md:text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                  
                  {/* Action attachments in-input block */}
                  <div className="absolute right-2 top-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-900 transition"
                      title="Attach Real Image Diagram"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                      title="Ground Real PDF Material"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={triggerMockVoiceSolver}
                      className={`p-1.5 rounded-lg transition ${
                        voiceRecording ? 'text-rose-500 bg-rose-500/10 animate-ping' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-900'
                      }`}
                      title="Record Voice Question"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSending || (!input.trim() && !selectedImage && !selectedPdfName)}
                  className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-2xl transition shadow-lg shrink-0"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="p-16 text-center m-auto space-y-3">
            <MessageSquare className="h-10 w-10 text-slate-700 mx-auto" />
            <h3 className="font-bold text-slate-300">No active discussion sessions</h3>
            <p className="text-xs text-slate-500">Initiate a Socratic doubt solving dialogue to debug equations, code blocks, or lectures.</p>
            <button
              onClick={handleCreateNewChat}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl transition inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Start AI Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
