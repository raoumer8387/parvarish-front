import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Target, Lightbulb } from 'lucide-react';

export function ProgressDashboard() {
  const [selectedChild, setSelectedChild] = useState('Ali');

  // Weekly progress data
  const behaviorData = [
    { week: 'Week 1', patience: 65, honesty: 75, empathy: 70, focus: 60 },
    { week: 'Week 2', patience: 70, honesty: 78, empathy: 75, focus: 65 },
    { week: 'Week 3', patience: 75, honesty: 85, empathy: 80, focus: 70 },
    { week: 'Week 4', patience: 75, honesty: 90, empathy: 80, focus: 70 },
  ];

  // Islamic knowledge data
  const islamicKnowledgeData = [
    { month: 'Jan', prayers: 70, quran: 60, hadith: 55, prophets: 65 },
    { month: 'Feb', prayers: 75, quran: 68, hadith: 62, prophets: 70 },
    { month: 'Mar', prayers: 80, quran: 75, hadith: 70, prophets: 78 },
    { month: 'Apr', prayers: 85, quran: 78, hadith: 75, prophets: 82 },
  ];

  // Game scores data
  const gameScoresData = [
    { game: 'Scenario Choice', score: 85 },
    { game: 'Islamic Quiz', score: 78 },
    { game: 'Memory Match', score: 92 },
    { game: 'Story Builder', score: 80 },
    { game: 'Empathy Challenge', score: 88 },
  ];

  // Current traits radar
  const currentTraitsData = [
    { trait: 'Patience', value: 75 },
    { trait: 'Honesty', value: 90 },
    { trait: 'Empathy', value: 80 },
    { trait: 'Focus', value: 70 },
    { trait: 'Respect', value: 85 },
    { trait: 'Kindness', value: 88 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#2D5F3F] mb-2 text-2xl sm:text-3xl lg:text-4xl">Progress Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your child's growth and development</p>
        </div>
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ali">Ali (8 years)</SelectItem>
            <SelectItem value="Umer">Umer (6 years)</SelectItem>
            <SelectItem value="Usman">Usman (10 years)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#A8E6CF] to-[#8BD4AE] text-white rounded-2xl">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-white/90 mb-1">Overall Progress</p>
          <p className="text-2xl sm:text-3xl">+15%</p>
          <p className="text-xs sm:text-sm text-white/80 mt-2">This month</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA] text-white rounded-2xl">
          <Award className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-white/90 mb-1">Achievements</p>
          <p className="text-2xl sm:text-3xl">12</p>
          <p className="text-xs sm:text-sm text-white/80 mt-2">Badges earned</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#FFE082] to-[#FFD54F] text-[#6B5B00] rounded-2xl">
          <Target className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base opacity-90 mb-1">Activities Done</p>
          <p className="text-2xl sm:text-3xl">40</p>
          <p className="text-xs sm:text-sm opacity-80 mt-2">This month</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#CE93D8] to-[#BA68C8] text-white rounded-2xl">
          <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-white/90 mb-1">Current Streak</p>
          <p className="text-2xl sm:text-3xl">7 🔥</p>
          <p className="text-xs sm:text-sm text-white/80 mt-2">Days in a row</p>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="behavioral" className="space-y-6">
        <TabsList className="bg-white rounded-xl p-1">
          <TabsTrigger value="behavioral" className="rounded-lg">
            Behavioral Growth
          </TabsTrigger>
          <TabsTrigger value="islamic" className="rounded-lg">
            Islamic Knowledge
          </TabsTrigger>
          <TabsTrigger value="games" className="rounded-lg">
            Game Scores
          </TabsTrigger>
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Behavioral Growth Tab */}
        <TabsContent value="behavioral" className="space-y-6">
          <Card className="p-4 sm:p-6 rounded-3xl">
            <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Behavioral Traits Progress</h3>
            <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
              <LineChart data={behaviorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="patience" stroke="#B3E5FC" strokeWidth={2} name="Patience ⏳" />
                <Line type="monotone" dataKey="honesty" stroke="#A8E6CF" strokeWidth={2} name="Honesty ⚖️" />
                <Line type="monotone" dataKey="empathy" stroke="#FFAB91" strokeWidth={2} name="Empathy ❤️" />
                <Line type="monotone" dataKey="focus" stroke="#CE93D8" strokeWidth={2} name="Focus 🧠" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Islamic Knowledge Tab */}
        <TabsContent value="islamic" className="space-y-6">
          <Card className="p-4 sm:p-6 rounded-3xl">
            <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Islamic Knowledge Growth</h3>
            <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
              <BarChart data={islamicKnowledgeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="prayers" fill="#A8E6CF" name="Prayers 🤲" radius={[8, 8, 0, 0]} />
                <Bar dataKey="quran" fill="#B3E5FC" name="Quran 📖" radius={[8, 8, 0, 0]} />
                <Bar dataKey="hadith" fill="#FFE082" name="Hadith 📚" radius={[8, 8, 0, 0]} />
                <Bar dataKey="prophets" fill="#CE93D8" name="Prophets 🌟" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Game Scores Tab */}
        <TabsContent value="games" className="space-y-6">
          <Card className="p-4 sm:p-6 rounded-3xl">
            <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Activity Performance</h3>
            <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
              <BarChart data={gameScoresData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} fontSize={12} />
                <YAxis dataKey="game" type="category" width={100} fontSize={10} className="sm:text-xs" />
                <Tooltip />
                <Bar dataKey="score" fill="#A8E6CF" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 rounded-3xl">
              <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Current Traits Overview</h3>
              <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
                <RadarChart data={currentTraitsData}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="trait" fontSize={10} className="sm:text-xs" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                  <Radar name="Current Level" dataKey="value" stroke="#A8E6CF" fill="#A8E6CF" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4 sm:p-6 rounded-3xl">
              <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Recent Achievements</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl">🏆</div>
                  <div className="flex-1">
                    <p className="text-gray-800">Honesty Champion</p>
                    <p className="text-sm text-gray-600">Completed 10 honesty activities</p>
                  </div>
                  <Badge className="bg-[#A8E6CF] text-[#2D5F3F]">New</Badge>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="text-3xl">📖</div>
                  <div className="flex-1">
                    <p className="text-gray-800">Quran Explorer</p>
                    <p className="text-sm text-gray-600">Read 5 surahs this week</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl">
                  <div className="text-3xl">⭐</div>
                  <div className="flex-1">
                    <p className="text-gray-800">7-Day Streak</p>
                    <p className="text-sm text-gray-600">Consistent learning for a week</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl">🎯</div>
                  <div className="flex-1">
                    <p className="text-gray-800">Patience Master</p>
                    <p className="text-sm text-gray-600">Improved patience by 20%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Suggestions Box */}
      <Card className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#A8E6CF]/20 to-[#B3E5FC]/20 border-2 border-[#A8E6CF]/30 mt-6 sm:mt-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="text-2xl sm:text-3xl flex-shrink-0">💡</div>
          <div>
            <h3 className="text-gray-800 mb-2 text-base sm:text-lg">Suggested Next Steps</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
              Based on {selectedChild}'s progress, we recommend:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#A8E6CF] flex-shrink-0">•</span>
                <span><strong>Focus Building:</strong> Try the "Memory Match" game to improve concentration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#B3E5FC] flex-shrink-0">•</span>
                <span><strong>Islamic Stories:</strong> Read Prophet Yusuf's story together to reinforce patience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFE082] flex-shrink-0">•</span>
                <span><strong>Daily Practice:</strong> Set a goal for 5 good deeds this week</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
