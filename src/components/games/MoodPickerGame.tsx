import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { completeMoodSession, getMoodScenarios, type MoodScenario, type MoodResponse } from '../../api/gamesApi';
import { getChildId } from '../../api/auth';

const GAME_TIME_LIMIT = 300;

export default function MoodPickerGame() {
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<MoodScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<MoodResponse[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  useEffect(() => {
    if (isComplete || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete, loading]);

  const loadScenarios = async () => {
    try {
      const data = await getMoodScenarios('6-8', 5);
      setScenarios(data);
      setLoading(false);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load game.' });
      setLoading(false);
    }
  };

  const handleAnswer = (mood: string) => {
    const newResponse: MoodResponse = {
      scenario_id: scenarios[currentIndex].id,
      selected_mood: mood,
      time_taken: Math.floor((Date.now() - startTime) / 1000),
    };
    const updated = [...responses, newResponse];
    setResponses(updated);
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit(updated);
    }
  };

  const handleTimeUp = () => {
    toast({ title: 'Time Up!', description: 'Submitting...' });
    handleSubmit();
  };

  const handleSubmit = async (finalResponses = responses) => {
    const childId = getChildId();
    if (!childId || finalResponses.length === 0) {
      toast({ title: 'Error', description: 'Cannot submit' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await completeMoodSession({
        child_id: childId,
        total_time_seconds: Math.floor((Date.now() - startTime) / 1000),
        responses: finalResponses,
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

  if (loading) return <div className="p-6"><Card className="p-6"><p className="text-center">Loading...</p></Card></div>;

  if (isComplete && result) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4"> Complete!</h1>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white mb-6">
            <div className="text-6xl font-bold mb-2">{result.score.percentage}%</div>
            <div className="text-2xl mb-4">{result.score.total_score} / {result.score.max_score}</div>
            <p className="text-xl">{result.completion_message}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4"><div className="text-3xl mb-2"></div><div className="font-semibold">Time</div><div className="text-gray-600">{result.time_taken}s</div></Card>
            <Card className="p-4"><div className="text-3xl mb-2"></div><div className="font-semibold">Questions</div><div className="text-gray-600">{result.score.breakdown.questions_answered}</div></Card>
            <Card className="p-4"><div className="text-3xl mb-2"></div><div className="font-semibold">Tasks</div><div className="text-gray-600">{result.tasks_generated}</div></Card>
          </div>
          <Button onClick={handleBack} size="lg" className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" />Back to Games</Button>
        </div>
      </div>
    );
  }

  if (!scenarios[currentIndex]) return <div className="p-6"><Card className="p-6"><p className="text-center">No scenarios</p></Card></div>;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 30;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Mood Picker</h1><p className="text-gray-600">Pick how you feel</p></div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xl ${urgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
            <span></span><span>{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
          <Button onClick={handleBack} variant="outline" className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        </div>
      </div>
      <div className="text-center text-lg font-semibold">Question {currentIndex + 1} of {scenarios.length}</div>
      <Card className="p-6">
        <p className="mb-4 text-lg font-medium">{scenarios[currentIndex].scenario_en}</p>
        {scenarios[currentIndex].scenario_ur && <p className="mb-6 text-gray-600 italic">{scenarios[currentIndex].scenario_ur}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {scenarios[currentIndex].mood_options.map((mood) => (
            <Button key={mood} variant="outline" className="rounded-xl h-20 text-lg hover:scale-105" onClick={() => handleAnswer(mood)} disabled={isSubmitting}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{mood === 'Anger' ? '' : mood === 'Sad' ? '' : mood === 'Happy' ? '' : mood === 'Forgive' ? '' : mood === 'Calm' ? '' : ''}</span>
                <span>{mood}</span>
              </div>
            </Button>
          ))}
        </div>
      </Card>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${((responses.length + 1) / scenarios.length) * 100}%` }}></div>
      </div>
    </div>
  );
}
