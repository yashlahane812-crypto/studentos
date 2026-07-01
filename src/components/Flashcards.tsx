import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Star,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Plus,
  RefreshCw
} from 'lucide-react';

export const Flashcards: React.FC = () => {
  const {
    flashcards,
    flashcardDecks,
    updateFlashcard,
    generateFlashcardsForTopic,
    addNotification,
    addXP
  } = useApp();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');

  // Topic generation states
  const [topicInput, setTopicInput] = useState('');
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);

  const handleGenerateByTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    setIsGeneratingTopic(true);
    const success = await generateFlashcardsForTopic(topicInput);
    setIsGeneratingTopic(false);
    if (success) {
      // Find the deck that was just created to auto-select it
      const createdDeck = (flashcardDecks || []).find(d => d.title.toLowerCase() === topicInput.toLowerCase());
      if (createdDeck) {
        setSelectedDeckId(createdDeck.id);
      } else if (flashcardDecks && flashcardDecks.length > 0) {
        // Fallback to the latest deck
        setSelectedDeckId(flashcardDecks[0].id);
      }
      setTopicInput('');
      setActiveIndex(0); // reset index to view the new deck
    }
  };

  const filteredCards = flashcards.filter(c => {
    const matchDeck = selectedDeckId === 'all' || c.deckId === selectedDeckId;
    const matchDiff = filterDifficulty === 'all' || c.difficulty === filterDifficulty;
    const matchFav = !favoriteOnly || c.isStarred;
    return matchDeck && matchDiff && matchFav;
  });

  const activeCard = filteredCards[activeIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setActiveIndex(prev => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setActiveIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  const handleRateDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    if (!activeCard) return;
    updateFlashcard(activeCard.id, { difficulty: diff });
    addXP(15, `Rated flashcard difficulty as ${diff}`);
    addNotification('Flashcard updated', `Card moved to ${diff} bin.`, 'info');
  };

  const handleStarToggle = () => {
    if (!activeCard) return;
    updateFlashcard(activeCard.id, { isStarred: !activeCard.isStarred });
  };

  return (
    <div className="space-y-6 text-white pb-10 max-w-4xl mx-auto">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <Layers className="h-6 w-6 text-purple-400 mr-2" /> AI Flashcard Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build active recall and review concepts using 3D flipping, stars, and categorized difficulty lists.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <select
            value={filterDifficulty}
            onChange={(e) => {
              setFilterDifficulty(e.target.value as any);
              setActiveIndex(0);
            }}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy Only</option>
            <option value="medium">Medium Only</option>
            <option value="hard">Hard Only</option>
          </select>

          <button
            onClick={() => {
              setFavoriteOnly(!favoriteOnly);
              setActiveIndex(0);
            }}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              favoriteOnly
                ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Star className="h-4.5 w-4.5" />
            <span>Starred</span>
          </button>
        </div>
      </div>

      {/* AI Instant Flashcard Generator Form */}
      <div className="p-5 bg-gradient-to-r from-purple-900/10 via-slate-900/40 to-blue-900/10 border border-slate-800/60 rounded-3xl backdrop-blur-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200">AI Instant Flashcard Generator</h3>
        </div>
        <p className="text-xs text-slate-400">
          Enter any academic subject or concept (e.g., "Mendelian Genetics", "Binary Search Trees", "Constitutional Law") to automatically compile interactive recall cards using Google Gemini.
        </p>
        <form onSubmit={handleGenerateByTopic} className="flex gap-2.5">
          <input
            type="text"
            required
            placeholder="e.g., Photosynthesis light reactions, Time Complexity, etc..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-purple-500 placeholder-slate-600 text-slate-200"
            disabled={isGeneratingTopic}
          />
          <button
            type="submit"
            disabled={isGeneratingTopic || !topicInput.trim()}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            {isGeneratingTopic ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Assembling...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Generate Cards</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ACTIVE TOPIC DECKS SELECTOR BAR */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Select Study Topic</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedDeckId('all');
              setActiveIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              selectedDeckId === 'all'
                ? 'bg-purple-600/15 border-purple-500/50 text-purple-300 shadow'
                : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            📚 All Topics ({flashcards.length})
          </button>
          {(flashcardDecks || []).map(deck => (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeckId(deck.id);
                setActiveIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                selectedDeckId === deck.id
                  ? 'bg-purple-600/15 border-purple-500/50 text-purple-300 shadow'
                  : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700'
              }`}
            >
              ⭐ {deck.title} ({deck.cards?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* FLASHCARD CAROUSEL VIEWPORT */}
      {filteredCards.length > 0 && activeCard ? (
        <div className="space-y-6">
          
          {/* Main 3D Card Structure */}
          <div className="relative h-80 w-full perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div
              className={`relative h-full w-full rounded-3xl transition-transform duration-500 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT: Question Side */}
              <div className="absolute inset-0 h-full w-full bg-slate-900 border border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between backface-hidden shadow-2xl overflow-y-auto">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>RECALL ATTEMPTS • QUESTION</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarToggle();
                    }}
                    className="p-1 text-slate-500 hover:text-amber-400 transition"
                  >
                    <Star className={`h-4.5 w-4.5 ${activeCard.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <div className="text-center py-6">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-100 leading-relaxed">
                    {activeCard.question}
                  </h3>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="font-mono bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded text-[10px] capitalize font-bold text-purple-400">
                    {activeCard.difficulty}
                  </span>
                  <span className="flex items-center text-slate-500 font-mono text-[10px]">
                    <RotateCw className="h-3 w-3 mr-1" /> Flip Card to Reveal Answer
                  </span>
                </div>
              </div>

              {/* BACK: Answer Side */}
              <div className="absolute inset-0 h-full w-full bg-purple-950/20 border border-purple-500/30 rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl overflow-y-auto">
                <div className="flex justify-between items-center text-[10px] text-purple-400 font-mono">
                  <span>EXPLANATORY VERIFICATION • ANSWER</span>
                  <Star className={`h-4.5 w-4.5 ${activeCard.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                </div>

                <div className="text-center py-6">
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
                    {activeCard.answer}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="font-mono bg-purple-950/60 border border-purple-900/40 px-2 py-0.5 rounded text-[10px] capitalize font-bold text-purple-300">
                    {activeCard.difficulty}
                  </span>
                  <span className="flex items-center text-slate-500 font-mono text-[10px]">
                    <RotateCw className="h-3 w-3 mr-1" /> Click to Flip Back
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Buttons */}
          <div className="flex justify-between items-center px-4">
            <button
              onClick={handlePrev}
              className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-400">
              Card {activeIndex + 1} of {filteredCards.length}
            </span>

            <button
              onClick={handleNext}
              className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-2xl transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Rate recall difficulty buttons */}
          <div className="p-5 bg-slate-900/30 border border-slate-800/60 rounded-3xl text-center space-y-3.5">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">How well did you recall this topic?</h4>
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
              <button
                onClick={() => handleRateDifficulty('easy')}
                className="py-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 text-xs font-bold text-emerald-300 rounded-xl transition"
              >
                Easy
              </button>
              <button
                onClick={() => handleRateDifficulty('medium')}
                className="py-2.5 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/30 text-xs font-bold text-amber-300 rounded-xl transition"
              >
                Medium
              </button>
              <button
                onClick={() => handleRateDifficulty('hard')}
                className="py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-xs font-bold text-rose-300 rounded-xl transition"
              >
                Hard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl">
          <Layers className="h-10 w-10 text-slate-700 mx-auto mb-2" />
          <h4 className="font-bold text-slate-300">No active flashcard sets matching filter</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You can create custom sets automatically by navigating to the Notes tab and selecting "Create Flashcards" on any note page.
          </p>
        </div>
      )}
    </div>
  );
};
