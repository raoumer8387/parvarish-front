import { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useToast } from '../ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { completeMemorySession } from '../../api/gamesApi';
import { getChildId } from '../../api/auth';

const GAME_TIME_LIMIT = 180;

export default function MemoryGame() {
  const { toast } = useToast();
  const [flips, setFlips] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

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

  const simulateFlip = (isMatch: boolean) => {
    setFlips((f) => f + 1);
    if (isMatch) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
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
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4"> Complete!</h1>
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl p-8 text-white mb-6">
            <div className="text-6xl font-bold mb-2">{result.score.percentage}%</div>
            <div className="text-2xl mb-4">{result.score.total_score} / {result.score.max_score}</div>
            <p className="text-xl">{result.completion_message}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4"><div className="text-3xl mb-2"></div><div className="font-semibold">Time</div><div className="text-gray-600">{result.time_taken}s</div></Card>
            <Card className="p-4"><div className="text-3xl mb-2"></div><div className="font-semibold">Correct</div><div className="text-gray-600">{correct}</div></Card>
            <Card className="p-4"><div className="text-3xl mb-2"></div><div className="font-semibold">Tasks</div><div className="text-gray-600">{result.tasks_generated}</div></Card>
          </div>
          <Button onClick={handleBack} size="lg" className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" />Back to Games</Button>
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 30;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Memory Match</h1><p className="text-gray-600">Find matching pairs</p></div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xl ${urgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
            <span></span><span>{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
          <Button onClick={handleBack} variant="outline" className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-6 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all" onClick={() => simulateFlip(Math.random() > 0.5)}>
            <span className="text-4xl"></span>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="font-semibold">Flips</div><div className="text-2xl">{flips}</div></Card>
        <Card className="p-4"><div className="font-semibold">Correct</div><div className="text-2xl text-green-600">{correct}</div></Card>
        <Card className="p-4"><div className="font-semibold">Wrong</div><div className="text-2xl text-red-600">{wrong}</div></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><span className="font-semibold">Time</span><Progress value={Math.min((timeLeft / GAME_TIME_LIMIT) * 100, 100)} className="w-2/3" /></div></Card>
      </div>
      <Button onClick={handleSubmit} className="rounded-xl w-full" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Result'}</Button>
    </div>
  );
}
