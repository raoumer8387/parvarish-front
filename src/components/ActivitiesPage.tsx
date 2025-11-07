import { Card } from './ui/card';
import { Button } from './ui/button';
import { Lightbulb, BookOpen, Puzzle, BookText, Heart, Trophy, Star, Sparkles } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  level: string;
}

interface ActivitiesPageProps {
  onStartActivity: (activityId: string) => void;
}

export function ActivitiesPage({ onStartActivity }: ActivitiesPageProps) {
  const activities: Activity[] = [
    {
      id: 'scenario-choice',
      title: 'Scenario Choice Game',
      description: 'Help children make ethical decisions in everyday situations',
      icon: <Lightbulb className="h-8 w-8" />,
      color: 'text-yellow-600',
      bgColor: 'from-yellow-100 to-yellow-50',
      level: 'All Ages',
    },
    {
      id: 'islamic-quiz',
      title: 'Islamic Knowledge Quiz',
      description: 'Test and improve Islamic knowledge with fun questions',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'text-green-600',
      bgColor: 'from-green-100 to-green-50',
      level: '6+ years',
    },
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Match Islamic concepts, Arabic letters, and good deeds',
      icon: <Puzzle className="h-8 w-8" />,
      color: 'text-blue-600',
      bgColor: 'from-blue-100 to-blue-50',
      level: '4+ years',
    },
    {
      id: 'story-completion',
      title: 'Story Builder',
      description: 'Complete moral stories with the right choices and values',
      icon: <BookText className="h-8 w-8" />,
      color: 'text-purple-600',
      bgColor: 'from-purple-100 to-purple-50',
      level: '7+ years',
    },
    {
      id: 'empathy-scenarios',
      title: 'Empathy Challenge',
      description: 'Learn to understand others feelings and show compassion',
      icon: <Heart className="h-8 w-8" />,
      color: 'text-red-600',
      bgColor: 'from-red-100 to-red-50',
      level: '5+ years',
    },
    {
      id: 'good-deeds',
      title: 'Good Deeds Tracker',
      description: 'Track daily good deeds and earn rewards',
      icon: <Star className="h-8 w-8" />,
      color: 'text-orange-600',
      bgColor: 'from-orange-100 to-orange-50',
      level: 'All Ages',
    },
    {
      id: 'prophet-stories',
      title: 'Prophet Stories',
      description: 'Interactive stories about Prophets and their teachings',
      icon: <Sparkles className="h-8 w-8" />,
      color: 'text-indigo-600',
      bgColor: 'from-indigo-100 to-indigo-50',
      level: '6+ years',
    },
    {
      id: 'patience-builder',
      title: 'Patience Builder',
      description: 'Fun activities to develop Sabr (patience) in children',
      icon: <Trophy className="h-8 w-8" />,
      color: 'text-teal-600',
      bgColor: 'from-teal-100 to-teal-50',
      level: '5+ years',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[#2D5F3F] mb-2 text-2xl sm:text-3xl lg:text-4xl">Mind Games & Activities</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Engaging activities to build character, Islamic knowledge, and positive behavior
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className={`p-6 rounded-3xl border-2 hover:shadow-2xl transition-all cursor-pointer bg-gradient-to-br ${activity.bgColor} hover:scale-105`}
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className={`${activity.color} mb-4`}>
                {activity.icon}
              </div>

              {/* Content */}
              <h3 className="text-gray-800 mb-2">{activity.title}</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                {activity.description}
              </p>

              {/* Level Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-3 py-1 rounded-full bg-white/60 ${activity.color}`}>
                  {activity.level}
                </span>
              </div>

              {/* Play Button */}
              <Button
                onClick={() => onStartActivity(activity.id)}
                className={`w-full rounded-xl ${activity.color} bg-white hover:bg-white/90 shadow-md`}
              >
                Play Now
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#A8E6CF]/30">
          <p className="text-sm sm:text-base text-gray-600 mb-1">Total Activities Completed</p>
          <p className="text-2xl sm:text-3xl text-[#2D5F3F]">127</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#B3E5FC]/30">
          <p className="text-sm sm:text-base text-gray-600 mb-1">Current Streak</p>
          <p className="text-2xl sm:text-3xl text-[#1E4F6F]">7 days 🔥</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#FFE082]/30">
          <p className="text-sm sm:text-base text-gray-600 mb-1">Stars Earned</p>
          <p className="text-2xl sm:text-3xl text-[#6B5B00]">★★★ 245</p>
        </Card>
      </div>
    </div>
  );
}
