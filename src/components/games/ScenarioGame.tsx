import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { completeScenarioSession, getScenarioQuestions, type ScenarioQuestion, type ScenarioResponse } from '../../api/gamesApi';
import { getChildId } from '../../api/auth';

const GAME_TIME_LIMIT = 300;

export default function ScenarioGame() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ScenarioQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<ScenarioResponse[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadQuestions();
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

  const loadQuestions = async () => {
    try {
      const data = await getScenarioQuestions('9-11', 5);
      setQuestions(data);
      setLoading(false);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to load game.' });
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    const newResponse: ScenarioResponse = {
      scenario_id: questions[currentIndex].id,
      selected_option: option,
      time_taken: Math.floor((Date.now() - startTime) / 1000),
    };
    const updated = [...responses, newResponse];
    setResponses(updated);
    if (currentIndex < questions.length - 1) {
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
      const res = await completeScenarioSession({
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
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-slate-100 animate-in zoom-in-95 duration-300 flex flex-col">
          
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-rose-100 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-4xl">🎯</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Game Complete!</h1>
            <p className="text-slate-600">Excellent decision-making skills!</p>
          </div>

          {/* Score Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Score</div>
            <div className="text-5xl font-black text-rose-600">{result.score.percentage}%</div>
            <div className="text-slate-400 font-medium mt-1">{result.score.total_score} / {result.score.max_score} points earned</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="text-2xl font-bold text-slate-800">{result.time_taken}s</div>
              <div className="text-xs text-blue-600 font-bold uppercase">Time</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="text-2xl mb-2">❓</div>
              <div className="text-2xl font-bold text-slate-800">{result.score.breakdown.questions_answered}</div>
              <div className="text-xs text-green-600 font-bold uppercase">Questions</div>
            </div>
          </div>

          <Button 
            onClick={handleBack} 
            className="w-full h-12 text-base font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg transition-transform hover:scale-[1.02] mt-auto"
            style={{ color: 'black' }}
          >
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  if (!questions[currentIndex]) return <div className="p-6"><Card className="p-6"><p className="text-center">No questions</p></Card></div>;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 30;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            What Would You Do?
          </h1>
          <p className="text-gray-600">Think carefully and choose the best option</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xl transition-all ${
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
            className="rounded-xl hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
      
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full font-semibold">
          <span>🤔</span>
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>
      
      <Card className="p-8 bg-gradient-to-br from-orange-50 to-rose-50 border-2 border-rose-200">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-4">💭</div>
            <p className="text-xl font-medium text-gray-800 leading-relaxed">
              {questions[currentIndex].question_en}
            </p>
            {questions[currentIndex].question_ur && (
              <p className="text-lg text-gray-600 italic mt-4 border-t pt-4">
                {questions[currentIndex].question_ur}
              </p>
            )}
          </div>
          
          <div className="grid gap-4">
            {questions[currentIndex].options.map((opt, idx) => (
              <Button 
                key={opt} 
                variant="outline" 
                className="rounded-xl justify-start text-lg py-6 hover:scale-105 transition-all duration-200 bg-white hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 border-2 hover:border-rose-300 shadow-md hover:shadow-lg text-left" 
                onClick={() => handleAnswer(opt)} 
                disabled={isSubmitting}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1">{opt}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </Card>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(((responses.length + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-sm" 
            style={{ width: `${((responses.length + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
