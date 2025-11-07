import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import * as behaviorApi from '../api/behaviorApi';

interface BehaviorPopupProps {
  parentId: number;
  onClose: () => void;
}

export function BehaviorTrackingPopup({ parentId, onClose }: BehaviorPopupProps) {
  const [questions, setQuestions] = useState<behaviorApi.BehaviorQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [parentId]);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await behaviorApi.getPersonalizedQuestions(parentId, 5);
      setQuestions(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Please add children to your profile first');
      } else {
        setError('Unable to load questions. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (childId: number, questionId: number, answer: string) => {
    const key = `${childId}_${questionId}`;
    setAnswers((prev) => ({ ...prev, [key]: answer }));
  };

  const getProgress = () => {
    const answered = Object.keys(answers).length;
    const total = questions.length;
    return { answered, total, percentage: total > 0 ? (answered / total) * 100 : 0 };
  };

  const isAllAnswered = () => {
    return questions.length > 0 && Object.keys(answers).length === questions.length;
  };

  const handleSubmit = async () => {
    if (!isAllAnswered()) return;

    setSubmitting(true);
    setError('');

    try {
      // Convert answers to API format
      const responses: behaviorApi.BehaviorResponse[] = Object.entries(answers).map(
        ([key, answer]) => {
          const [childId, questionId] = key.split('_').map(Number);
          return { child_id: childId, question_id: questionId, answer };
        }
      );

      await behaviorApi.submitBehaviorResponses(responses);
      behaviorApi.markBehaviorCheckInComplete();
      behaviorApi.clearReminder();
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError('Failed to save responses. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskLater = () => {
    behaviorApi.setReminder();
    onClose();
  };

  const progress = getProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl my-8">
        <div className="relative p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#2D5F3F] mb-2 flex items-center gap-2">
              📋 Daily Behavior Check-in
            </h2>
            <p className="text-gray-600 text-sm">
              Help us understand your children better by answering these quick questions
            </p>
          </div>

          {/* Progress */}
          {!loading && questions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {progress.answered} of {progress.total} answered
                </span>
                <span className="text-sm font-medium text-[#2D5F3F]">
                  {Math.round(progress.percentage)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8E6CF] mx-auto mb-4" />
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4 text-5xl">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadQuestions} className="bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F]">
                  Retry
                </Button>
              </div>
            ) : success ? (
              <div className="text-center py-12">
                <div className="text-green-600 mb-4 text-5xl">✅</div>
                <p className="text-green-600 font-medium text-lg">Responses saved successfully!</p>
                <p className="text-gray-600 text-sm mt-2">Thank you for completing today's check-in</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-5xl">📋</div>
                <p className="text-gray-600 mb-2">No questions available</p>
                <p className="text-sm text-gray-500">Please add children to your profile first</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const key = `${question.child_id}_${question.question_id}`;
                  const selectedAnswer = answers[key];

                  return (
                    <Card key={key} className="p-4 border-2 border-gray-100 hover:border-[#A8E6CF] transition-colors">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            Question {index + 1} of {questions.length}
                          </span>
                          {question.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-[#FFF8E1] text-[#6B5B00]">
                              {question.category}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium">{question.question_text}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {question.options.map((option) => (
                          <button
                            key={option}
                            onClick={() =>
                              handleAnswerSelect(question.child_id, question.question_id, option)
                            }
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              selectedAnswer === option
                                ? 'border-[#A8E6CF] bg-[#A8E6CF] text-[#2D5F3F] font-medium'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-[#A8E6CF]'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!loading && !error && !success && questions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleAskLater}
                className="flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Ask Me Later
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isAllAnswered() || submitting}
                className="flex-1 bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] hover:from-[#8BD4AE] hover:to-[#A8E6CF] text-[#2D5F3F] rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2D5F3F]" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Answers'
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
