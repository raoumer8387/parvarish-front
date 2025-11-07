import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, Star, Heart } from 'lucide-react';

interface GameScreenProps {
  activityId: string;
  onBack: () => void;
}

interface Question {
  id: number;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    feedback: string;
    isCorrect: boolean;
    trait: string;
  }[];
}

export function GameScreen({ activityId: _activityId, onBack }: GameScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Sample questions for Scenario Choice Game
  const questions: Question[] = [
    {
      id: 1,
      scenario: '🏫 At School',
      question: 'Your friend forgot their lunch money. You have extra money. What do you do?',
      options: [
        {
          id: 'A',
          text: 'Share your lunch money with them',
          feedback: 'Excellent! You showed generosity and empathy. The Prophet (PBUH) said: "The believer\'s shade on the Day of Resurrection will be his charity."',
          isCorrect: true,
          trait: 'Empathy & Generosity',
        },
        {
          id: 'B',
          text: 'Keep it for yourself',
          feedback: 'Think about how your friend feels. Islam teaches us to help others in need. Try again!',
          isCorrect: false,
          trait: 'Self-focus',
        },
        {
          id: 'C',
          text: 'Tell the teacher only',
          feedback: 'Good thinking, but you could also help directly. Combining both actions shows true compassion!',
          isCorrect: false,
          trait: 'Partial Help',
        },
      ],
    },
    {
      id: 2,
      scenario: '🏠 At Home',
      question: 'Your sibling broke your favorite toy by accident. How do you react?',
      options: [
        {
          id: 'A',
          text: 'Get angry and yell at them',
          feedback: 'Anger can hurt relationships. The Prophet (PBUH) said: "The strong person is not the one who can wrestle, but the one who controls himself in anger."',
          isCorrect: false,
          trait: 'Anger',
        },
        {
          id: 'B',
          text: 'Forgive them and say it\'s okay',
          feedback: 'Mashallah! You showed beautiful patience and forgiveness. Allah loves those who forgive others.',
          isCorrect: true,
          trait: 'Patience & Forgiveness',
        },
        {
          id: 'C',
          text: 'Break something of theirs',
          feedback: 'Revenge is not the Islamic way. We should treat others with kindness even when hurt. Try again!',
          isCorrect: false,
          trait: 'Revenge',
        },
      ],
    },
    {
      id: 3,
      scenario: '🎮 During Play',
      question: 'You found money on the playground. What should you do?',
      options: [
        {
          id: 'A',
          text: 'Keep it for yourself',
          feedback: 'Islam teaches us honesty. Taking what isn\'t ours is not right. Think about the right choice!',
          isCorrect: false,
          trait: 'Dishonesty',
        },
        {
          id: 'B',
          text: 'Try to find the owner or give it to a teacher',
          feedback: 'Perfect! You demonstrated honesty and trustworthiness. The Prophet (PBUH) was known as "Al-Amin" (The Trustworthy).',
          isCorrect: true,
          trait: 'Honesty & Integrity',
        },
        {
          id: 'C',
          text: 'Share it with friends',
          feedback: 'Sharing is good, but the money should be returned to its owner first. That\'s true honesty!',
          isCorrect: false,
          trait: 'Partial Honesty',
        },
      ],
    },
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setShowFeedback(true);
    
    const selectedOpt = questions[currentQuestion].options.find(o => o.id === optionId);
    if (selectedOpt?.isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Game complete
      setShowFeedback(false);
      setSelectedOption('complete');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const selectedOptData = currentQ?.options.find(o => o.id === selectedOption);

  if (selectedOption === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full p-12 rounded-3xl text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-[#2D5F3F] mb-4">Congratulations!</h1>
          <p className="text-xl text-gray-700 mb-6">
            You completed the Scenario Choice Game!
          </p>
          
          <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFE082] rounded-2xl p-8 mb-8">
            <p className="text-gray-600 mb-2">Your Score</p>
            <p className="text-5xl text-[#2D5F3F]">
              {score} / {questions.length}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(score)].map((_, i) => (
                <Star key={i} className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
          </div>

          <p className="text-gray-700 mb-8 italic">
            "Keep practicing good character. Every good deed is like a seed that will grow into a beautiful tree!"
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => {
                setCurrentQuestion(0);
                setScore(0);
                setSelectedOption(null);
                setShowFeedback(false);
              }}
              className="bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F] rounded-xl px-8"
            >
              Play Again
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="rounded-xl px-8"
            >
              Back to Activities
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] to-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">Back to Activities</span>
        </Button>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
          <span className="text-base sm:text-lg">Score: {score}/{questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Question Card */}
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block bg-[#B3E5FC] text-[#1E4F6F] px-4 sm:px-6 py-2 rounded-full mb-4 text-sm sm:text-base">
            {currentQ.scenario}
          </div>
          <h2 className="text-gray-800 text-lg sm:text-xl lg:text-2xl">{currentQ.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {currentQ.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const showResult = showFeedback && isSelected;
            
            return (
              <button
                key={option.id}
                onClick={() => !showFeedback && handleOptionSelect(option.id)}
                disabled={showFeedback}
                className={`w-full p-4 sm:p-6 rounded-2xl text-left transition-all border-3 ${
                  showResult
                    ? option.isCorrect
                      ? 'bg-green-100 border-green-400'
                      : 'bg-red-100 border-red-400'
                    : isSelected
                    ? 'bg-[#B3E5FC] border-[#B3E5FC]'
                    : 'bg-white border-gray-200 hover:border-[#A8E6CF] hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl ${
                      showResult
                        ? option.isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-[#A8E6CF] text-[#2D5F3F]'
                    }`}
                  >
                    {option.id}
                  </div>
                  <p className="flex-1 text-sm sm:text-base text-gray-800">{option.text}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && selectedOptData && (
          <div
            className={`p-4 sm:p-6 rounded-2xl mb-4 sm:mb-6 ${
              selectedOptData.isCorrect
                ? 'bg-green-50 border-2 border-green-300'
                : 'bg-orange-50 border-2 border-orange-300'
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-3xl sm:text-4xl flex-shrink-0">
                {selectedOptData.isCorrect ? '✅' : '💡'}
              </div>
              <div className="flex-1">
                <h3 className="text-gray-800 mb-2 text-base sm:text-lg">
                  {selectedOptData.isCorrect ? 'Excellent Choice!' : 'Let\'s Learn Together!'}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-3">{selectedOptData.feedback}</p>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-xs sm:text-sm text-gray-600">Trait: {selectedOptData.trait}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Button */}
        {showFeedback && (
          <Button
            onClick={handleNext}
            className="w-full bg-[#A8E6CF] hover:bg-[#8BD4AE] text-[#2D5F3F] rounded-xl h-14 text-lg"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'See Results 🎉'}
          </Button>
        )}
      </Card>
    </div>
  );
}
