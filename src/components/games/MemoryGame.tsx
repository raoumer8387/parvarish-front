import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { ArrowLeft, Star, Heart, Sun, Moon, Flower, Zap, Gift, Music } from 'lucide-react';
import { completeMemorySession } from '../../api/gamesApi';
import { getChildId } from '../../api/auth';

const GAME_TIME_LIMIT = 180;

// Game symbols and colors
const SYMBOLS = [
  { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
  { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' },
  { icon: Moon, color: 'text-blue-500', bg: 'bg-blue-100' },
  { icon: Flower, color: 'text-pink-500', bg: 'bg-pink-100' },
  { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-100' },
  { icon: Gift, color: 'text-green-500', bg: 'bg-green-100' },
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
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

  // Initialize game cards
  useEffect(() => {
    const gameCards: GameCard[] = [];
    // Create pairs of cards (only 4 pairs = 8 cards)
    for (let i = 0; i < 4; i++) {
      const symbolIndex = i % SYMBOLS.length;
      gameCards.push(
        { id: i * 2, symbolIndex, isFlipped: false, isMatched: false },
        { id: i * 2 + 1, symbolIndex, isFlipped: false, isMatched: false }
      );
    }
    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    setCards(gameCards);
  }, []);

  useEffect(() => {
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle card flipping logic
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
              ? { ...card, isMatched: true }
              : card
          ));
          setCorrect(c => c + 1);
          setFlippedCards([]);
          
          // Check if game is complete
          const updatedCards = cards.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          );
          if (updatedCards.every(card => card.isMatched)) {
            handleSubmit();
          }
        }, 1000);
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
    if (flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.includes(cardId)) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    setFlippedCards(prev => [...prev, cardId]);
    setFlips(f => f + 1);
  };

  const handleTimeUp = () => {
    toast({ title: 'Time Up!', description: 'Submitting...' });
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (isComplete) return;
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
      toast({ title: 'Error', description: e?.response?.data?.detail || 'Failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/child/games');
    window.location.reload();
  };

  if (isComplete && result) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full space-y-8 animate-in fade-in duration-700">
          {/* Celebration Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4 mb-4">
              <span className="text-7xl animate-bounce" style={{ animationDelay: '0ms' }}>🎉</span>
              <span className="text-7xl animate-bounce" style={{ animationDelay: '150ms' }}>🎊</span>
              <span className="text-7xl animate-bounce" style={{ animationDelay: '300ms' }}>✨</span>
            </div>
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
              Memory Master!
            </h1>
            <p className="text-gray-700 text-2xl font-medium">You've completed the challenge! 🧠</p>
          </div>
          
          {/* Score Display */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-10 text-white shadow-2xl border-4 border-white/30">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-8xl font-black mb-3 drop-shadow-2xl">{result.score.percentage}%</div>
                  <div className="text-3xl font-semibold opacity-90">{result.score.total_score} / {result.score.max_score} Points</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t-2 border-white/30">
                <p className="text-2xl text-center font-medium">{result.completion_message}</p>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="p-10 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 border-3 border-blue-400 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 rounded-2xl">
              <div className="text-center space-y-4">
                <div className="text-7xl mb-4 filter drop-shadow-lg">⏱️</div>
                <div className="text-xl font-black text-blue-900 uppercase tracking-wider">Time Taken</div>
                <div className="text-6xl font-black text-blue-800 drop-shadow-md">{result.time_taken}s</div>
              </div>
            </Card>
            <Card className="p-10 bg-gradient-to-br from-green-100 via-green-200 to-green-300 border-3 border-green-400 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 rounded-2xl">
              <div className="text-center space-y-4">
                <div className="text-7xl mb-4 filter drop-shadow-lg">✅</div>
                <div className="text-xl font-black text-green-900 uppercase tracking-wider">Correct Matches</div>
                <div className="text-6xl font-black text-green-800 drop-shadow-md">{correct}</div>
              </div>
            </Card>
          </div>
          
          {/* Back Button */}
          <div className="flex justify-center pt-6">
            <Button 
              onClick={handleBack} 
              size="lg" 
              className="rounded-2xl px-16 py-7 text-xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-4 border-purple-300/50 uppercase tracking-wide"
            >
              <ArrowLeft className="mr-3 h-7 w-7" />
              Back to Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 30;

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex flex-col">
      {/* Row 1: Header - Compact height */}
      <div className="flex items-center justify-between px-6 py-2 bg-white/80 backdrop-blur-sm shadow-sm shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Memory Match
          </h1>
          <p className="text-sm text-gray-600">Find matching pairs to win!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-sm">
            <span>🧠</span>
            {correct} / 4
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl font-bold text-sm transition-all ${
            urgent 
              ? 'bg-red-100 text-red-600 animate-pulse shadow-lg' 
              : 'bg-green-100 text-green-600'
          }`}>
            <span>{urgent ? '⚠️' : '⏰'}</span>
            <span>{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
          <Button 
            onClick={handleBack} 
            variant="outline" 
            size="sm"
            className="rounded-xl hover:bg-gray-50"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </Button>
        </div>
      </div>

      {/* Row 2-5: Game Board - 4 rows with 2 cards each */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-4 min-h-0 overflow-auto">
        {[0, 1, 2, 3].map((rowIndex) => (
          <div key={rowIndex} className="flex gap-4 w-full max-w-[600px]">
            {cards.slice(rowIndex * 2, rowIndex * 2 + 2).map((card) => {
              const symbol = SYMBOLS[card.symbolIndex];
              const IconComponent = symbol.icon;
              
              return (
                <Card 
                  key={card.id} 
                  className={`
                    cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl
                    flex-1 aspect-square flex items-center justify-center min-h-0
                    ${card.isFlipped || card.isMatched 
                      ? `${symbol.bg} ${symbol.color} border-2 border-purple-200` 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-2 border-purple-300'
                    }
                    ${card.isMatched ? 'ring-4 ring-green-400 ring-opacity-50 animate-bounce' : ''}
                    ${flippedCards.includes(card.id) && !card.isMatched ? 'animate-pulse ring-2 ring-blue-400' : ''}
                  `}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="flex items-center justify-center w-full h-full p-4">
                    {card.isFlipped || card.isMatched ? (
                      <IconComponent className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold text-3xl sm:text-4xl drop-shadow-md">?</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      {/* Last Row: Stats Cards */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-blue-100/50 backdrop-blur-sm shadow-lg shrink-0 border-t-2 border-purple-200">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          {/* Stats Cards */}
          <Card className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-blue-100 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 transform hover:scale-105">
            <div className="text-3xl mb-2 filter drop-shadow-sm">🔄</div>
            <div className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Total Flips</div>
            <div className="text-3xl font-black text-blue-800">{flips}</div>
          </Card>
          
          <Card className="flex-1 p-4 bg-gradient-to-br from-green-50 to-green-100 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 transform hover:scale-105">
            <div className="text-3xl mb-2 filter drop-shadow-sm">✅</div>
            <div className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wide">Correct</div>
            <div className="text-3xl font-black text-green-700">{correct}</div>
          </Card>
          
          <Card className="flex-1 p-4 bg-gradient-to-br from-red-50 to-red-100 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-200 hover:border-red-400 transform hover:scale-105">
            <div className="text-3xl mb-2 filter drop-shadow-sm">❌</div>
            <div className="text-xs font-bold text-red-700 mb-1 uppercase tracking-wide">Wrong</div>
            <div className="text-3xl font-black text-red-700">{wrong}</div>
          </Card>
          
          <Card className="flex-1 p-4 bg-gradient-to-br from-purple-50 to-purple-100 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 transform hover:scale-105">
            <div className="text-3xl mb-2 filter drop-shadow-sm">📊</div>
            <div className="text-xs font-bold text-purple-700 mb-1 uppercase tracking-wide">Progress</div>
            <div className="text-3xl font-black text-purple-700">{Math.round((correct / 4) * 100)}%</div>
          </Card>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            size="lg"
            className="rounded-xl px-6 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-110 whitespace-nowrap border-2 border-purple-400" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="text-sm font-bold text-white">Submitting...</span>
              </>
            ) : (
              <>
                <span className="mr-2 text-xl">🎯</span>
                <span className="text-sm font-bold text-white">Submit</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
