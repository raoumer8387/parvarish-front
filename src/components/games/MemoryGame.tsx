import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { ArrowLeft, Star, Heart, Sun, Moon, Flower, Zap, Gift, Music, Eye, Timer, Trophy, RotateCcw } from 'lucide-react';
import { completeMemorySession } from '../../api/gamesApi';
import { getChildId } from '../../api/auth';

const GAME_TIME_LIMIT = 180;
const PREVIEW_TIME = 3000; // 3 seconds preview

// Defined colors for better contrast
const SYMBOLS = [
  { icon: Star, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
  { icon: Sun, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
  { icon: Moon, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
  { icon: Flower, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' },
  { icon: Zap, color: 'text-violet-600', bg: 'bg-violet-100', border: 'border-violet-200' },
  { icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  { icon: Music, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
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
  const [isPreviewing, setIsPreviewing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const startTime = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

  // Debug: Log colors when completion screen renders
  useEffect(() => {
    if (isComplete && result) {
      setTimeout(() => {
        const button = document.querySelector('button[class*="emerald"]');
        const h1 = document.querySelector('h1');
        const scoreText = document.querySelector('[class*="text-indigo"]');
        
        if (button) {
          const buttonStyles = window.getComputedStyle(button);
          console.log('Button Background Color:', buttonStyles.backgroundColor);
          console.log('Button Text Color:', buttonStyles.color);
          console.log('Button Classes:', button.className);
        }
        
        if (h1) {
          const h1Styles = window.getComputedStyle(h1);
          console.log('H1 Text Color:', h1Styles.color);
          console.log('H1 Classes:', h1.className);
        }
        
        if (scoreText) {
          const scoreStyles = window.getComputedStyle(scoreText);
          console.log('Score Text Color:', scoreStyles.color);
          console.log('Score Classes:', scoreText.className);
        }
      }, 100);
    }
  }, [isComplete, result]);

  // --- Game Logic ---
  useEffect(() => {
    const gameCards: GameCard[] = [];
    for (let i = 0; i < 4; i++) {
      const symbolIndex = i % SYMBOLS.length;
      gameCards.push(
        { id: i * 2, symbolIndex, isFlipped: true, isMatched: false },
        { id: i * 2 + 1, symbolIndex, isFlipped: true, isMatched: false }
      );
    }
    
    // Shuffle
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    setCards(gameCards);

    // Preview Timer
    const previewTimer = setTimeout(() => {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));
      setIsPreviewing(false);
      startTime.current = Date.now();
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      if (firstCard && secondCard && firstCard.symbolIndex === secondCard.symbolIndex) {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          ));
          setCorrect(c => c + 1);
          setFlippedCards([]);
          
          const updatedCards = cards.map(card => 
            card.id === first || card.id === second ? { ...card, isMatched: true } : card
          );
          if (updatedCards.every(card => card.isMatched)) {
            handleSubmit();
          }
        }, 500);
      } else {
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

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));
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
    if (!childId) return; // Handle error appropriately
    
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
    } catch (e) {
      // console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/child/games');
    window.location.reload();
  };

  // --- Render ---

  // 1. Completion Screen (Fixed White Text Issue)
  if (isComplete && result) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col">
          
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Level Complete!</h1>
            <p className="text-slate-600">Great memory skills!</p>
          </div>

          {/* Score Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Score</div>
            <div className="text-5xl font-black text-indigo-600">{result.score.percentage}%</div>
            <div className="text-slate-400 font-medium mt-1">{result.score.total_score} points earned</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <Timer className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{result.time_taken}s</div>
              <div className="text-xs text-blue-600 font-bold uppercase">Time</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <RotateCcw className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{flips}</div>
              <div className="text-xs text-green-600 font-bold uppercase">Flips</div>
            </div>
          </div>

          <Button 
            onClick={handleBack} 
            className="w-full h-12 text-base font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-transform hover:scale-[1.02] mt-auto"
            style={{ color: 'black' }}
          >
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  // 2. Active Game Screen
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-6 w-6 text-slate-700" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Memory Match</h1>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>Pair the symbols</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPreviewing && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold animate-pulse border border-yellow-200">
                <Eye className="w-3.5 h-3.5" />
                <span>MEMORIZE</span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm border ${
              timeLeft < 30 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-700 border-slate-200 shadow-sm'
            }`}>
              <Timer className="w-4 h-4" />
              <span>{mins}:{secs.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Game Board - Centered & Framed */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl p-4 sm:p-8">
          
          {/* Grid Container */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mx-auto max-w-2xl">
            {cards.map((card) => {
              const symbol = SYMBOLS[card.symbolIndex];
              const IconComponent = symbol.icon;
              
              return (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    relative aspect-square cursor-pointer perspective-1000 group
                    ${card.isMatched ? 'pointer-events-none' : ''}
                  `}
                >
                  <div className={`
                    w-full h-full rounded-2xl shadow-sm transition-all duration-500 transform-style-3d
                    flex items-center justify-center border-b-4
                    ${card.isMatched ? 'opacity-0 scale-90' : 'hover:-translate-y-1 hover:shadow-md'}
                    ${card.isFlipped 
                      ? 'bg-white border-slate-200 rotate-y-180' 
                      : 'bg-indigo-500 border-indigo-700'
                    }
                  `}>
                    {card.isFlipped ? (
                      <div className={`p-3 rounded-xl ${symbol.bg} ${symbol.color} animate-in zoom-in duration-300`}>
                        <IconComponent className="w-8 h-8 sm:w-12 sm:h-12" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <span className="text-4xl sm:text-5xl font-bold text-white/20 select-none">?</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Footer Stats */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-8 text-center sm:text-left">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flips</div>
              <div className="text-2xl font-black text-slate-800">{flips}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matched</div>
              <div className="text-2xl font-black text-emerald-600">{correct} / 4</div>
            </div>
          </div>
          
          <Button 
            size="lg"
            onClick={handleSubmit}
            disabled={correct < 4 || isSubmitting}
            className={`
              w-full sm:w-auto rounded-xl font-bold shadow-lg transition-all
              ${correct === 4 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105' 
                : 'bg-slate-100 text-slate-400'
              }
            `}
          >
            {isSubmitting ? 'Saving...' : correct === 4 ? 'Finish Game' : 'Match All to Finish'}
          </Button>
        </div>
      </footer>
    </div>
  );
}