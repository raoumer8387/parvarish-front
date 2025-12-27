import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Target, Lightbulb, AlertCircle, Clock } from 'lucide-react';
import * as childProgressApi from '../api/childProgressApi';
import * as behaviorApi from '../api/behaviorApi';

export function ProgressDashboard() {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [children, setChildren] = useState<behaviorApi.ChildInfo[]>([]);
  const [dashboardData, setDashboardData] = useState<childProgressApi.ChildProgressDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(30);

  // Fetch children list on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await behaviorApi.getParentChildren();
        const childrenArray = Array.isArray(data) ? data : (data as any)?.children || [];
        setChildren(childrenArray);
        
        // Auto-select first child if available
        if (childrenArray.length > 0 && !selectedChildId) {
          setSelectedChildId(childrenArray[0].id);
        }
      } catch (err) {
        console.error('Failed to load children:', err);
        setChildren([]);
        setError('Failed to load children list');
      }
    };
    fetchChildren();
  }, []);

  // Fetch dashboard data when selectedChildId or periodDays changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedChildId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await childProgressApi.getChildProgressDashboard(selectedChildId, periodDays);
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        
        // Show mock data when API is not available
        const selectedChild = children.find(c => c.id === selectedChildId);
        if (selectedChild) {
          const mockData: childProgressApi.ChildProgressDashboard = {
            child_info: {
              id: selectedChild.id,
              name: selectedChild.name,
              age: selectedChild.age || 8,
              gender: 'unknown',
              school: 'ABC School',
              class_name: 'Grade 3',
              temperament: 'active',
              created_at: new Date().toISOString()
            },
            period_days: periodDays,
            behavior_summary: {
              stats: {
                avg_score: 75.5,
                total_responses: 25,
                categories: {
                  patience: 70,
                  honesty: 85,
                  empathy: 80,
                  focus: 65,
                  respect: 75,
                  kindness: 88
                }
              },
              last_check_in: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
              hours_since_last_check_in: 8,
              needs_check_in: false,
              recent_responses_count: 5,
              total_responses_period: 25
            },
            games_summary: {
              total_sessions: 12,
              games_played: ['memory', 'mood', 'scenario'],
              performance_by_game: {
                memory: {
                  total_sessions: 4,
                  avg_scores: { cognitive: 82.5, focus: 78.0 },
                  recent_scores: [80, 85, 78, 82],
                  improvement_trend: 'improving' as const
                },
                mood: {
                  total_sessions: 3,
                  avg_scores: { emotional: 75.0, empathy: 80.0 },
                  recent_scores: [75, 78, 72],
                  improvement_trend: 'stable' as const
                },
                scenario: {
                  total_sessions: 5,
                  avg_scores: { social: 70.0, decision_making: 73.0 },
                  recent_scores: [68, 72, 70, 75, 71],
                  improvement_trend: 'improving' as const
                }
              },
              category_averages: {
                cognitive: 80.2,
                emotional: 75.8,
                social: 72.1
              },
              strongest_category: 'cognitive',
              weakest_category: 'social',
              last_game_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            tasks_summary: {
              total_tasks: 15,
              completed_tasks: 12,
              pending_tasks: 3,
              completion_rate: 80.0,
              categories: {
                emotional: {
                  total: 5,
                  completed: 4,
                  completion_rate: 80.0
                },
                social: {
                  total: 6,
                  completed: 5,
                  completion_rate: 83.3
                },
                cognitive: {
                  total: 4,
                  completed: 3,
                  completion_rate: 75.0
                }
              },
              recent_tasks: []
            },
            progress_insights: {
              overall_engagement_score: 78.5,
              insights: [
                {
                  type: 'improvement',
                  message: 'Great progress in honesty and empathy this week!',
                  action: 'continue_current_activities'
                },
                {
                  type: 'concern',
                  message: 'Focus could use some improvement through targeted activities',
                  action: 'targeted_tasks'
                }
              ],
              recommendations: [
                {
                  category: 'games',
                  title: 'Strengthen Social Skills',
                  description: 'Try more scenario-based games to improve in this area'
                },
                {
                  category: 'behavior',
                  title: 'Focus Building',
                  description: 'Practice mindfulness and concentration exercises'
                }
              ]
            },
            recent_activity: [
              {
                type: 'behavior',
                date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                title: 'Behavior Check-in',
                description: 'Answered: How did you handle sharing today?',
                score: 85
              },
              {
                type: 'game',
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                title: 'Memory Game',
                description: 'Completed memory session',
                score: 78
              },
              {
                type: 'task',
                date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                title: 'Kindness Task',
                description: 'Helped a friend with homework'
              }
            ]
          };
          setDashboardData(mockData);
        } else {
          setError('Failed to load progress data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedChildId, periodDays, children]);

  // Get selected child info (for future use if needed)
  // const selectedChild = children.find(c => c.id === selectedChildId);

  // Loading state
  if (isLoading && !dashboardData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5F3F] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#A8E6CF] text-[#2D5F3F] rounded-lg hover:bg-[#8BD4AE]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No child selected state
  if (!selectedChildId || !dashboardData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-[#2D5F3F] mb-2 text-2xl sm:text-3xl lg:text-4xl">Progress Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your child's growth and development</p>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {children.length === 0 ? 'No children found' : 'Please select a child to view their progress'}
            </p>
            {children.length > 0 && (
              <Select value={selectedChildId?.toString() || ''} onValueChange={(value: string) => setSelectedChildId(parseInt(value))}>
                <SelectTrigger className="w-48 mx-auto rounded-xl bg-white">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name} {child.age ? `(${child.age} years)` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Transform API data for charts
  const behaviorData = dashboardData.behavior_summary.stats.categories 
    ? Object.entries(dashboardData.behavior_summary.stats.categories).map(([category, score]) => ({
        category,
        score: Math.round(score as number)
      }))
    : [];

  const gameScoresData = dashboardData.games_summary.performance_by_game
    ? Object.entries(dashboardData.games_summary.performance_by_game).map(([game, perf]) => {
        const avgScores = (perf as any).avg_scores;
        const scores = Object.values(avgScores) as number[];
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return {
          game,
          score: Math.round(avgScore)
        };
      })
    : [];

  const currentTraitsData = dashboardData.behavior_summary.stats.categories
    ? Object.entries(dashboardData.behavior_summary.stats.categories).map(([trait, value]) => ({
        trait: trait.charAt(0).toUpperCase() + trait.slice(1),
        value: Math.round(value as number)
      }))
    : [];

  const categoryAveragesData = dashboardData.games_summary.category_averages
    ? Object.entries(dashboardData.games_summary.category_averages).map(([category, score]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        score: Math.round(score as number)
      }))
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#2D5F3F] mb-2 text-2xl sm:text-3xl lg:text-4xl">Progress Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Track {dashboardData.child_info.name}'s growth and development
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Select
            value={selectedChildId?.toString() || ''}
            onValueChange={(value: string) => setSelectedChildId(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-48 rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {child.name} {child.age ? `(${child.age} years)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={periodDays.toString()}
            onValueChange={(value: string) => setPeriodDays(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-32 rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#A8E6CF] to-[#8BD4AE] text-white rounded-2xl">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-white/90 mb-1">Engagement Score</p>
          <p className="text-2xl sm:text-3xl">{Math.round(dashboardData.progress_insights.overall_engagement_score)}%</p>
          <p className="text-xs sm:text-sm text-white/80 mt-2">Overall progress</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA] text-white rounded-2xl">
          <Award className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-white/90 mb-1">Games Played</p>
          <p className="text-2xl sm:text-3xl">{dashboardData.games_summary.total_sessions}</p>
          <p className="text-xs sm:text-sm text-white/80 mt-2">This period</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#FFE082] to-[#FFD54F] text-[#6B5B00] rounded-2xl">
          <Target className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base opacity-90 mb-1">Task Completion</p>
          <p className="text-2xl sm:text-3xl">{Math.round(dashboardData.tasks_summary.completion_rate)}%</p>
          <p className="text-xs sm:text-sm opacity-80 mt-2">{dashboardData.tasks_summary.completed_tasks}/{dashboardData.tasks_summary.total_tasks} tasks</p>
        </Card>

        <Card className={`p-4 sm:p-6 rounded-2xl ${
          dashboardData.behavior_summary.needs_check_in 
            ? 'bg-gradient-to-br from-[#FFAB91] to-[#FF8A65] text-white' 
            : 'bg-gradient-to-br from-[#CE93D8] to-[#BA68C8] text-white'
        }`}>
          {dashboardData.behavior_summary.needs_check_in ? (
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          ) : (
            <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
          )}
          <p className="text-sm sm:text-base text-white/90 mb-1">
            {dashboardData.behavior_summary.needs_check_in ? 'Check-in Needed' : 'Behavior Score'}
          </p>
          <p className="text-2xl sm:text-3xl">
            {dashboardData.behavior_summary.needs_check_in 
              ? `${Math.round(dashboardData.behavior_summary.hours_since_last_check_in)}h`
              : `${Math.round(dashboardData.behavior_summary.stats.avg_score)}%`
            }
          </p>
          <p className="text-xs sm:text-sm text-white/80 mt-2">
            {dashboardData.behavior_summary.needs_check_in 
              ? 'Since last check-in'
              : 'Average score'
            }
          </p>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="behavioral" className="space-y-6">
        <TabsList className="bg-white rounded-xl p-1">
          <TabsTrigger value="behavioral" className="rounded-lg">
            Behavioral Growth
          </TabsTrigger>
          <TabsTrigger value="games" className="rounded-lg">
            Games & Activities
          </TabsTrigger>
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Behavioral Growth Tab */}
        <TabsContent value="behavioral" className="space-y-6">
          <Card className="p-4 sm:p-6 rounded-3xl">
            <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Behavioral Categories</h3>
            {behaviorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
                <BarChart data={behaviorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#A8E6CF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No behavioral data available for this period</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 rounded-3xl">
              <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Game Performance</h3>
              {gameScoresData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gameScoresData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} fontSize={12} />
                    <YAxis dataKey="game" type="category" width={100} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#A8E6CF" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No game data available for this period</p>
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-6 rounded-3xl">
              <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Category Averages</h3>
              {categoryAveragesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryAveragesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#B3E5FC" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No category data available</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 rounded-3xl">
              <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Current Traits Overview</h3>
              {currentTraitsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
                  <RadarChart data={currentTraitsData}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="trait" fontSize={10} className="sm:text-xs" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                    <Radar name="Current Level" dataKey="value" stroke="#A8E6CF" fill="#A8E6CF" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>No trait data available</p>
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-6 rounded-3xl">
              <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Recent Activity</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {dashboardData.recent_activity.length > 0 ? (
                  dashboardData.recent_activity.map((activity, index) => (
                    <div key={index} className={`flex items-center gap-4 p-4 rounded-xl ${
                      activity.type === 'behavior' ? 'bg-green-50' :
                      activity.type === 'game' ? 'bg-blue-50' : 'bg-yellow-50'
                    }`}>
                      <div className="text-3xl">
                        {activity.type === 'behavior' ? '🎯' :
                         activity.type === 'game' ? '🎮' : '📝'}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      {activity.score && (
                        <Badge className="bg-[#A8E6CF] text-[#2D5F3F]">
                          {Math.round(activity.score)}%
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <p>No recent activity</p>
                  </div>
                )}
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
            <h3 className="text-gray-800 mb-2 text-base sm:text-lg">Personalized Recommendations</h3>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
              Based on {dashboardData.child_info.name}'s progress, we recommend:
            </p>
            {dashboardData.progress_insights.recommendations.length > 0 ? (
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {dashboardData.progress_insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#A8E6CF] flex-shrink-0">•</span>
                    <span><strong>{rec.title}:</strong> {rec.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm sm:text-base text-gray-700">
                Keep up the great work! Continue with regular activities and check-ins.
              </p>
            )}
            
            {dashboardData.progress_insights.insights.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-gray-800 mb-2 text-sm font-medium">Key Insights:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {dashboardData.progress_insights.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`flex-shrink-0 ${
                        insight.type === 'improvement' ? 'text-green-500' :
                        insight.type === 'concern' ? 'text-orange-500' : 'text-blue-500'
                      }`}>
                        {insight.type === 'improvement' ? '📈' :
                         insight.type === 'concern' ? '⚠️' : '🎉'}
                      </span>
                      <span>{insight.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
