import { Card } from './ui/card';
import { Button } from './ui/button';
import { Gamepad2, Trophy, Star, Target } from 'lucide-react';

interface GamesPageProps {
  onStartGame: (gameId: string) => void;
}

export function GamesPage({ onStartGame }: GamesPageProps) {
  const games = [
    {
      id: 'scenario-choice',
      title: 'Scenario Choice',
      description: 'Make the right choices in different life situations based on Islamic values',
      icon: '🎯',
      color: 'from-purple-400 to-purple-600',
      difficulty: 'Easy',
    },
    {
      id: 'moral-quest',
      title: 'Moral Quest',
      description: 'Embark on an adventure where your moral choices shape the story',
      icon: '🗺️',
      color: 'from-blue-400 to-blue-600',
      difficulty: 'Medium',
    },
    {
      id: 'empathy-challenge',
      title: 'Empathy Challenge',
      description: 'Learn to understand and respond to others\' feelings',
      icon: '❤️',
      color: 'from-pink-400 to-pink-600',
      difficulty: 'Easy',
    },
    {
      id: 'honesty-trials',
      title: 'Honesty Trials',
      description: 'Face challenging situations where honesty is tested',
      icon: '✨',
      color: 'from-yellow-400 to-orange-500',
      difficulty: 'Medium',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Games</h1>
          <p className="text-gray-600">Learn Islamic values through interactive games</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Games Played</p>
              <p className="text-2xl font-bold text-blue-700">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Total Stars</p>
              <p className="text-2xl font-bold text-yellow-700">48</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-700">85%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <Card
            key={game.id}
            className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`h-32 bg-gradient-to-r ${game.color} flex items-center justify-center`}>
              <span className="text-6xl">{game.icon}</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-800">{game.title}</h3>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  {game.difficulty}
                </span>
              </div>
              <p className="text-gray-600 mb-4 min-h-[3rem]">{game.description}</p>
              <Button
                onClick={() => onStartGame(game.id)}
                className="w-full bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] hover:from-[#8BD4AE] hover:to-[#A8E6CF] text-[#2D5F3F] font-semibold rounded-xl"
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                Play Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
