import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, Clock, Star, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BehaviorTrackingPopup } from './BehaviorTrackingPopup';
import * as behaviorApi from '../api/behaviorApi';
import TaskList from './TaskList';
import { NotificationTicker } from './NotificationTicker';
import { LackingAnalysisSection } from './LackingAnalysisSection';
import { GuidanceModal } from './GuidanceModal';
import { TaskGenerationPanel } from './TaskGenerationPanel';
import { fetchLackingAnalysis, LackingArea, Notification } from '../api/lackingApi';

interface ChildWithStats extends behaviorApi.ChildInfo {
  behaviorLevel?: number;
  islamicKnowledge?: number;
  categories?: Record<string, number>;
  loading?: boolean;
  needsCheckIn?: boolean;
}

const quotes = [
  "The best gift a parent can give their child is good character.",
  "Children are like wet cement; whatever falls on them makes an impression.",
  "Your children are not your children, they are the sons and daughters of Life's longing for itself.",
];

export function ParentDashboard() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const [children, setChildren] = useState<ChildWithStats[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [showBehaviorPopup, setShowBehaviorPopup] = useState(false);
  const [selectedChildForCheckIn, setSelectedChildForCheckIn] = useState<number | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [selectedChildForTasks, setSelectedChildForTasks] = useState<number | null>(null);
  
  // Lacking analysis state
  const [lackingData, setLackingData] = useState<{
    child_name: string;
    total_games_played: number;
    lacking_areas: LackingArea[];
    requires_attention: boolean;
  } | null>(null);
  const [loadingLacking, setLoadingLacking] = useState(false);
  const [selectedLacking, setSelectedLacking] = useState<LackingArea | null>(null);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(false);

  // Fetch children list, their stats, and check-in status
  useEffect(() => {
    const fetchChildrenAndStats = async () => {
      setLoadingChildren(true);
      try {
        // Get list of children
        const childrenList = await behaviorApi.getParentChildren();
        const childrenArray = Array.isArray(childrenList) ? childrenList : (childrenList as any)?.children || [];
        
        if (childrenArray.length > 0) {
            setSelectedChildForTasks(childrenArray[0].id);
        }

        // Get check-in status for all children
        let checkInStatusMap = new Map<number, boolean>();
        try {
          const checkInStatus = await behaviorApi.getCheckInStatus();
          checkInStatus.children.forEach(child => {
            checkInStatusMap.set(child.child_id, child.needs_check_in);
          });
        } catch (err) {
          console.error('Failed to load check-in status:', err);
        }
        
        // Fetch stats for each child
        const childrenWithStats = await Promise.all(
          childrenArray.map(async (child: behaviorApi.ChildInfo) => {
            try {
              const stats = await behaviorApi.getChildStats(child.id);
              return {
                ...child,
                behaviorLevel: stats.behavior_level || 0,
                islamicKnowledge: stats.islamic_knowledge || 0,
                categories: stats.categories || {},
                needsCheckIn: checkInStatusMap.get(child.id) || false,
              };
            } catch (err) {
              console.error(`Failed to load stats for child ${child.id}:`, err);
              // Return child with default stats on error
              return {
                ...child,
                behaviorLevel: 0,
                islamicKnowledge: 0,
                categories: {},
                needsCheckIn: checkInStatusMap.get(child.id) || false,
              };
            }
          })
        );
        
        setChildren(childrenWithStats);
      } catch (err) {
        console.error('Failed to load children:', err);
        setChildren([]);
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildrenAndStats();

    // Get parent ID from user info
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        setParentId(1); // TODO: Get actual parent_id from userInfo
      } catch (err) {
        console.error('Failed to parse user info', err);
      }
    }

    // Check if behavior popup should be shown
    if (behaviorApi.shouldShowBehaviorPopup() || behaviorApi.shouldShowReminder()) {
      setShowBehaviorPopup(true);
    }
  }, []);

  const handleOpenBehaviorCheckIn = (childId?: number) => {
    if (childId) {
      setSelectedChildForCheckIn(childId);
    }
    setShowBehaviorPopup(true);
  };

  const handleCloseBehaviorPopup = () => {
    setShowBehaviorPopup(false);
    setSelectedChildForCheckIn(null);
    // Refresh check-in status after closing popup
    refreshCheckInStatus();
  };

  const refreshCheckInStatus = async () => {
    try {
      const checkInStatus = await behaviorApi.getCheckInStatus();
      setChildren(prevChildren => 
        prevChildren.map(child => {
          const status = checkInStatus.children.find(c => c.child_id === child.id);
          return {
            ...child,
            needsCheckIn: status?.needs_check_in || false,
          };
        })
      );
    } catch (err) {
      console.error('Failed to refresh check-in status:', err);
    }
  };

  // Fetch lacking analysis for selected child
  useEffect(() => {
    if (selectedChildForTasks) {
      fetchLackingData(selectedChildForTasks);
    }
  }, [selectedChildForTasks]);

  const fetchLackingData = async (childId: number) => {
    setLoadingLacking(true);
    try {
      const data = await fetchLackingAnalysis(childId, 7); // Last 7 days
      setLackingData(data);
    } catch (err) {
      console.error('Failed to load lacking analysis:', err);
      setLackingData(null);
    } finally {
      setLoadingLacking(false);
    }
  };

  const handleGetGuidance = (area: LackingArea) => {
    setSelectedLacking(area);
    setShowGuidanceModal(true);
  };

  const handleGenerateTasks = () => {
    setShowGuidanceModal(false);
    setShowTaskPanel(true);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Find the child and select them
    const child = children.find(c => c.name === notification.child_name);
    if (child) {
      setSelectedChildForTasks(child.id);
    }
  };

  const handleChildSelectionChange = (childId: number) => {
    setSelectedChildForTasks(childId);
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8">
      {/* Notification Ticker */}
      <NotificationTicker 
        childId={selectedChildForTasks || undefined}
        onNotificationClick={handleNotificationClick}
      />
      
      {/* Behavior Tracking Popup */}
      {showBehaviorPopup && parentId && (
        <BehaviorTrackingPopup
          parentId={parentId}
          onClose={handleCloseBehaviorPopup}
          preSelectedChildId={selectedChildForCheckIn || undefined}
        />
      )}

      {/* Guidance Modal */}
      {selectedLacking && selectedChildForTasks && (
        <GuidanceModal
          isOpen={showGuidanceModal}
          onClose={() => setShowGuidanceModal(false)}
          childId={selectedChildForTasks}
          childName={lackingData?.child_name || ''}
          lackingArea={selectedLacking.area}
          lackingLabel={selectedLacking.label}
          score={selectedLacking.score}
          onGenerateTasks={handleGenerateTasks}
        />
      )}

      {/* Task Generation Panel */}
      {selectedLacking && selectedChildForTasks && (
        <TaskGenerationPanel
          isOpen={showTaskPanel}
          onClose={() => setShowTaskPanel(false)}
          childId={selectedChildForTasks}
          childName={lackingData?.child_name || ''}
          lackingArea={selectedLacking.area}
          lackingLabel={selectedLacking.label}
        />
      )}

      {/* Welcome Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h1 className="text-[#2D5F3F] text-2xl sm:text-3xl lg:text-4xl">Welcome, Parent</h1>
          <Button
            onClick={() => handleOpenBehaviorCheckIn()}
            className="bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] hover:from-[#8BD4AE] hover:to-[#A8E6CF] text-[#2D5F3F] rounded-xl font-medium relative"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Daily Check-in
            {children.filter(c => c.needsCheckIn).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {children.filter(c => c.needsCheckIn).length}
              </span>
            )}
          </Button>
        </div>
        <div className="flex items-start gap-2 bg-white/60 p-3 sm:p-4 rounded-2xl border-l-4 border-[#A8E6CF]">
          <span className="text-xl sm:text-2xl">💡</span>
          <p className="text-sm sm:text-base text-gray-700 italic">"{randomQuote}"</p>
        </div>
      </div>

      {/* Children Profiles */}
      <h2 className="text-[#2D5F3F] mb-4 text-xl sm:text-2xl">Your Children</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
        {loadingChildren ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF]" />
              <p className="text-gray-600">Loading children...</p>
            </div>
          </div>
        ) : children.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No children found. Please add children to your profile.</p>
          </div>
        ) : (
          children.map((child) => (
            <Card 
                key={child.id} 
                className={`p-6 hover:shadow-xl transition-shadow rounded-3xl border-2 ${selectedChildForTasks === child.id ? 'border-[#A8E6CF]' : 'border-transparent'}`}
                onClick={() => setSelectedChildForTasks(child.id)}
            >
              {/* Check-in Status Badge */}
              {child.needsCheckIn ? (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                  ⏰ Check-in Due
                </div>
              ) : (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  ✓ Checked in
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6 mt-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8E6CF] to-[#B3E5FC] flex items-center justify-center text-3xl">
                  {/* Default avatar - could be customized per child */}
                  👧
                </div>
                <div>
                  <h3 className="text-[#2D5F3F]">{child.name}</h3>
                  <p className="text-gray-600">{child.age || 'N/A'} years old</p>
                </div>
              </div>

              {/* Check-in Action Button */}
              {child.needsCheckIn && (
                <div className="mb-4">
                  <Button 
                    onClick={() => handleOpenBehaviorCheckIn(child.id)}
                    className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl font-medium"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Daily Check-in
                  </Button>
                </div>
              )}

              {/* Summary Stats */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-700">Behavior Level</span>
                    <Badge className="bg-[#A8E6CF] text-[#2D5F3F] hover:bg-[#A8E6CF]">
                      {child.behaviorLevel || 0}%
                    </Badge>
                  </div>
                  <Progress value={child.behaviorLevel || 0} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-700">Islamic Knowledge</span>
                    <Badge className="bg-[#B3E5FC] text-[#1E4F6F] hover:bg-[#B3E5FC]">
                      {child.islamicKnowledge || 0}%
                    </Badge>
                  </div>
                  <Progress value={child.islamicKnowledge || 0} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-700">Games Played</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>--</span>
                  </div>
                </div>
              </div>

              {/* Categories from stats */}
              {child.categories && Object.keys(child.categories).length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(child.categories).map(([category, percentage]) => (
                    <div key={category} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600 capitalize">{category}</p>
                        <p className="text-sm text-gray-800">{percentage || 0}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Placeholder traits when no categories */}
              {(!child.categories || Object.keys(child.categories).length === 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                    <Heart className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">No data</p>
                      <p className="text-sm text-gray-800">--</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">No data</p>
                      <p className="text-sm text-gray-800">--</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Lacking Analysis Section */}
      {selectedChildForTasks && lackingData && (
        <div className="mb-8">
          {loadingLacking ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF]" />
                <p className="text-gray-600">Loading capability analysis...</p>
              </div>
            </div>
          ) : (
            <LackingAnalysisSection
              childId={selectedChildForTasks}
              childName={lackingData.child_name}
              lackingAreas={lackingData.lacking_areas}
              totalGamesPlayed={lackingData.total_games_played}
              onGetGuidance={handleGetGuidance}
              children={children.map(c => ({ id: c.id, name: c.name }))}
              onChildChange={handleChildSelectionChange}
            />
          )}
        </div>
      )}

      {/* Task List */}
      {selectedChildForTasks && (
        <TaskList 
          childId={selectedChildForTasks} 
          children={children.map(c => ({ id: c.id, name: c.name }))}
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#A8E6CF] to-[#8BD4AE] text-white rounded-2xl">
          <p className="text-white/90 mb-2 text-sm sm:text-base">Total Activities</p>
          <p className="text-2xl sm:text-3xl">40</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#B3E5FC] to-[#81D4FA] text-white rounded-2xl">
          <p className="text-white/90 mb-2 text-sm sm:text-base">Avg Progress</p>
          <p className="text-2xl sm:text-3xl">82%</p>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-[#FFF8E1] to-[#FFE082] text-[#6B5B00] rounded-2xl">
          <p className="opacity-90 mb-2 text-sm sm:text-base">This Week</p>
          <p className="text-2xl sm:text-3xl">+15%</p>
        </Card>
      </div>
    </div>
  );
}
