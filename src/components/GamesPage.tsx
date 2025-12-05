import { Card } from './ui/card';

interface GamesPageProps {
  onStartGame: (gameId: string) => void;
}

export function GamesPage({ onStartGame }: GamesPageProps) {
  const handleGameClick = (gameId: string) => {
    onStartGame(gameId);
  };

  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Test your focus and memory',
      icon: '🧠',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      bgPattern: 'from-violet-50 to-purple-50',
    },
    {
      id: 'mood',
      title: 'Mood Picker',
      description: 'Choose feelings for different situations',
      icon: '😊',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      bgPattern: 'from-cyan-50 to-blue-50',
    },
    {
      id: 'scenario',
      title: 'What Would You Do?',
      description: 'Make wise choices',
      icon: '🎯',
      gradient: 'from-rose-500 via-pink-500 to-red-500',
      bgPattern: 'from-rose-50 to-pink-50',
    },
    {
      id: 'islamic-quiz',
      title: 'Islamic Quiz',
      description: 'Learn and answer',
      icon: '📖',
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      bgPattern: 'from-amber-50 to-yellow-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Choose Your Game! 
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium">
            Pick a game and start your adventure
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {games.map((game) => (
            <Card
              key={game.id}
              className="group relative overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer bg-white"
            >
              <div className={'absolute inset-0 bg-gradient-to-br ' + game.bgPattern + ' opacity-50'}></div>
              
              <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className={'w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br ' + game.gradient + ' flex items-center justify-center shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500'}>
                  <span className="text-5xl sm:text-6xl lg:text-7xl">{game.icon}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                  {game.title}
                </h3>

                <p className="text-base sm:text-lg text-gray-600 font-medium">
                  {game.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGameClick(game.id);
                  }}
                  className={`w-full sm:w-auto px-8 py-6 sm:py-7 text-lg sm:text-xl font-bold rounded-2xl bg-gradient-to-r ${game.gradient} !text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}
                >
                  Play Now! 🎮
                </button>

                <div className={'absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ' + game.gradient + ' opacity-10 blur-2xl'}></div>
                <div className={'absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br ' + game.gradient + ' opacity-10 blur-2xl'}></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
