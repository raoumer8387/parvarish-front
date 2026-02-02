import React, { useState, useEffect } from 'react';
import {
  fetchActivityHistory,
  ActivityHistoryResponse,
  TimelineActivity,
} from '../api/activityHistoryApi';
import { getAllChildren } from '../api/settingsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Gamepad2,
  CheckSquare,
  Heart,
  MessageCircle,
  Trophy,
  Calendar,
  Activity,
  Filter,
  Loader2,
  Users,
} from 'lucide-react';

type ActivityType = 'all' | 'game' | 'task' | 'behavior' | 'chat';

interface Child {
  id: number;
  name: string;
  age: number;
}

const ActivityHistoryPage: React.FC = () => {
  const [activityData, setActivityData] = useState<ActivityHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedFilter, setSelectedFilter] = useState<ActivityType>('all');
  const [childId, setChildId] = useState<number | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  // Fetch children list on mount
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoadingChildren(true);
    try {
      const childrenData = await getAllChildren();
      console.log('Fetched children data:', childrenData); // Debug log
      
      // Handle different response formats
      const childrenArray = Array.isArray(childrenData) ? childrenData : childrenData?.children || [];
      setChildren(childrenArray);
      
      // Auto-select first child if available
      if (childrenArray.length > 0) {
        const storedChildId = localStorage.getItem('selected_child_id');
        if (storedChildId && childrenArray.some((c: Child) => c.id === parseInt(storedChildId))) {
          setChildId(parseInt(storedChildId));
        } else {
          setChildId(childrenArray[0].id);
          localStorage.setItem('selected_child_id', childrenArray[0].id.toString());
        }
      } else {
        console.warn('No children found in response'); // Debug log
        setError('No children found. Please add a child profile first.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error fetching children:', err);
      console.error('Error details:', err.response?.data); // Debug log
      setError(err.response?.data?.detail || 'Failed to load children list. Please check if you have added any children in Settings.');
      setLoading(false);
    } finally {
      setLoadingChildren(false);
    }
  };

  // Fetch activity history when childId or selectedDays changes
  useEffect(() => {
    if (childId && !loadingChildren) {
      loadActivityHistory();
    }
  }, [childId, selectedDays, loadingChildren]);

  const loadActivityHistory = async () => {
    if (!childId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchActivityHistory(childId, selectedDays);
      setActivityData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load activity history. Please try again.');
      console.error('Error fetching activity history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter timeline based on selected activity type
  const filteredTimeline = activityData?.timeline.filter((activity) => {
    if (selectedFilter === 'all') return true;
    return activity.type === selectedFilter;
  }) || [];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="w-5 h-5" />;
      case 'task':
        return <CheckSquare className="w-5 h-5" />;
      case 'behavior':
        return <Heart className="w-5 h-5" />;
      case 'chat':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  // Get activity color based on type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'game':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'task':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'behavior':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'chat':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Get activity details text
  const getActivityDetails = (activity: TimelineActivity) => {
    switch (activity.type) {
      case 'game':
        return `Played ${activity.data.game_type || 'unknown'} game${
          activity.data.raw_result?.score ? ` - Score: ${activity.data.raw_result.score}` : ''
        }`;
      case 'task':
        return `${activity.data.status === 'completed' ? 'Completed' : 'Assigned'} task: ${
          activity.data.title
        }`;
      case 'behavior':
        return `Behavior tracked - Score: ${activity.data.score}/10`;
      case 'chat':
        return `Chat message: ${activity.data.content?.substring(0, 50)}${activity.data.content?.length > 50 ? '...' : ''}`;
      default:
        return 'Activity';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading activity history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!activityData) {
    return null;
  }

  const stats = activityData.stats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Child Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Activity History</h1>
            <p className="text-muted-foreground">
              {activityData.child_name}'s activities over the past {selectedDays} days
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex gap-2">
            <Button
              variant={selectedDays === 7 ? 'default' : 'outline'}
              onClick={() => setSelectedDays(7)}
            >
              Last 7 Days
            </Button>
            <Button
              variant={selectedDays === 30 ? 'default' : 'outline'}
              onClick={() => setSelectedDays(30)}
            >
              Last 30 Days
            </Button>
            <Button
              variant={selectedDays === 90 ? 'default' : 'outline'}
              onClick={() => setSelectedDays(90)}
            >
              Last 90 Days
            </Button>
          </div>
        </div>

        {/* Child Selector (if multiple children) */}
        {children.length > 1 && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <label className="text-sm font-medium">Select Child:</label>
              <Select
                value={childId?.toString()}
                onValueChange={(value: string) => {
                  const newChildId = parseInt(value);
                  setChildId(newChildId);
                  localStorage.setItem('selected_child_id', value);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name} ({child.age} years)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activityData.total_activities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all activity types
            </p>
          </CardContent>
        </Card>

        {/* Total Games Played */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <Gamepad2 className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.total_games_played}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(stats.games_by_type).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckSquare className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.tasks_completed}/{stats.total_tasks}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.total_tasks > 0 ? (stats.tasks_completed / stats.total_tasks) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.tasks_pending} pending
            </p>
          </CardContent>
        </Card>

        {/* XP Earned */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">XP Earned</CardTitle>
            <Trophy className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.xp_earned}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Experience points
            </p>
          </CardContent>
        </Card>

        {/* Average Behavior Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Behavior Score</CardTitle>
            <Heart className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats.average_behavior_score.toFixed(1)}/10
            </div>
            <div className="flex gap-1 mt-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i < Math.round(stats.average_behavior_score)
                      ? 'bg-purple-600'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total_behavior_responses} responses
            </p>
          </CardContent>
        </Card>

        {/* Most Active Day */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Active Day</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {stats.most_active_day
                ? new Date(stats.most_active_day).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Peak engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Type Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                View all activities in chronological order
              </CardDescription>
            </div>
            <Filter className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={(value: string) => setSelectedFilter(value as ActivityType)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="game">Games</TabsTrigger>
              <TabsTrigger value="task">Tasks</TabsTrigger>
              <TabsTrigger value="behavior">Behaviors</TabsTrigger>
              <TabsTrigger value="chat">Chats</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Timeline */}
          <div className="mt-6 space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTimeline.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activities found for the selected filter.</p>
              </div>
            ) : (
              filteredTimeline.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${getActivityColor(
                    activity.type
                  )}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium capitalize">{activity.type}</p>
                        <p className="text-sm mt-1">
                          {getActivityDetails(activity)}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 text-xs">
                        {formatDate(activity.timestamp)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityHistoryPage;
