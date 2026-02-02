import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { ArrowLeft, Star, Heart, Sun, Moon, Flower, Zap, Gift, Music, Eye } from 'lucide-react';
import { completeMemorySession } from '../../api/gamesApi';
import { getChildId } from '../../api/auth';
import { cn } from '../ui/utils'; // Assuming you have a utils file, otherwise remove cn usage

const GAME_TIME_LIMIT = 180;
const PREVIEW_TIME = 3000; // 3 seconds to memorize

// Game symbols with cleaner colors
const SYMBOLS = [
  { icon: Star, color: 'text-amber-500', bg: 'bg-amber-100' },
  { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100' },
  { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' },
  { icon: Moon, color: 'text-sky-500', bg: 'bg-sky-100' },
  { icon: Flower, color: 'text-pink-500', bg: 'bg-pink-100' },
  { icon: Zap, color: 'text-violet-500', bg: 'bg-violet-100' },
  { icon: Gift, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-100' },
];

interface GameCard {
  id: number;
  symbolIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const { toast } = useToast();
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [flips, setFlips] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [isComplete, setIsComplete] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(true); // New state for initial preview
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const startTime = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

  // Initialize game
  useEffect(() => {
    const gameCards: GameCard[] = [];
    // Create 4 pairs = 8 cards
    for (let i = 0; i < 4; i++) {
      const symbolIndex = i % SYMBOLS.length;
      gameCards.push(
        { id: i * 2, symbolIndex, isFlipped: true, isMatched: false }, // Start FLIPPED for preview
        { id: i * 2 + 1, symbolIndex, isFlipped: true, isMatched: false }
      );
    }
    
    // Shuffle
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    setCards(gameCards);

    // Initial Preview Timer
    const previewTimer = setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
      setIsPreviewing(false);
      startTime.current = Date.now(); // Reset start time after preview
      startGameTimer();
    }, PREVIEW_TIME);

    return () => clearTimeout(previewTimer);
  }, []);

  const startGameTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Matching Logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      if (firstCard && secondCard && firstCard.symbolIndex === secondCard.symbolIndex) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          ));
          setCorrect(c => c + 1);
          setFlippedCards([]);
          
          // Check Win Condition
          const updatedCards = cards.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          );
          if (updatedCards.every(card => card.isMatched)) {
            handleSubmit();
          }
        }, 500); // Faster feedback
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setWrong(w => w + 1);
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  const handleCardClick = (cardId: number) => {
    if (isPreviewing || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.includes(cardId)) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    setFlippedCards(prev => [...prev, cardId]);
    setFlips(f => f + 1);
  };

  const handleTimeUp = () => {
    toast({ title: 'Time Up!', description: 'Submitting result...' });
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (isComplete) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const childId = getChildId();
    if (!childId) {
      toast({ title: 'Error', description: 'No child profile found' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await completeMemorySession({
        child_id: childId,
        total_flips: flips,
        correct_matches: correct,
        wrong_matches: wrong,
        time_taken_seconds: Math.floor((Date.now() - startTime.current) / 1000),
      });
      setResult(res);
      setIsComplete(true);
    } catch (e: any) {
      toast({ title: 'Error', description: e?.response?.data?.detail || 'Failed to submit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/child/games');
    window.location.reload();
  };

  // --- Render Functions ---

  if (isComplete && result) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Great Job! 🎉</h1>
            <p className="text-slate-500 text-lg">You completed the memory challenge.</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="text-6xl font-black mb-2">{result.score.percentage}%</div>
            <div className="text-indigo-100 font-medium">Total Score: {result.score.total_score}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 p-4 rounded-xl">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-sm font-bold text-slate-500 uppercase">Time</div>
              <div className="text-xl font-bold text-slate-900">{result.time_taken}s</div>
            </div>
            <div className="bg-slate-100 p-4 rounded-xl">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm font-bold text-slate-500 uppercase">Matches</div>
              <div className="text-xl font-bold text-slate-900">{correct}</div>
            </div>
          </div>

          <Button 
            onClick={handleBack} 
            className="w-full h-14 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
          >
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 30;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#FFF8E1] to-[#E8F5E9] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Memory Match</h1>
            <p className="text-sm text-slate-500 hidden sm:block">Find all matching pairs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {/* Preview Indicator */}
           {isPreviewing && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-bold animate-pulse">
              <Eye className="w-4 h-4" />
              <span>Memorize!</span>
            </div>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold transition-colors ${
            isUrgent ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'
          }`}>
            <span>⏰</span>
            <span>{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full max-w-4xl mx-auto">
          {cards.map((card) => {
            const symbol = SYMBOLS[card.symbolIndex];
            const IconComponent = symbol.icon;
            
            return (
              <div 
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`
                  relative cursor-pointer group perspective-1000 w-full h-full min-h-[140px] sm:min-h-[160px] rounded-2xl transition-all duration-300
                  ${card.isMatched ? 'opacity-50 scale-95 pointer-events-none' : 'hover:-translate-y-1 hover:shadow-lg'}
                `}
              >
                {/* Card Container - using absolute positioning for clean flips if needed, 
                    but here we just swap content for simplicity and robustness */}
                <div className={`
                  w-full h-full rounded-2xl shadow-md border-b-4 flex items-center justify-center transition-all duration-500
                  ${card.isFlipped 
                    ? `bg-white border-slate-300 shadow-lg` 
                    : `bg-indigo-500 border-indigo-700`
                  }
                `}>
                  {card.isFlipped ? (
                    <div className={`p-4 rounded-full ${symbol.bg} ${symbol.color} animate-in zoom-in duration-300`}>
                      <IconComponent className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="text-indigo-200 font-bold text-5xl sm:text-6xl opacity-50 select-none">
                      ?
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Stats */}
      <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flips</div>
              <div className="text-2xl font-black text-slate-700">{flips}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched</div>
              <div className="text-2xl font-black text-emerald-600">{correct} / 4</div>
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || correct < 4}
            className={`
              px-8 py-6 rounded-xl font-bold text-lg shadow-lg transition-all
              ${correct === 4 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? 'Saving...' : 'Finish Game'}
          </Button>
        </div>
      </footer>
    </div>
  );
}