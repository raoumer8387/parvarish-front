import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle, Loader2, RefreshCw, AlertTriangle, Users, Activity } from 'lucide-react';
import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { BehaviorTrackingPopup } from './BehaviorTrackingPopup';
import * as behaviorApi from '../api/behaviorApi';
import * as childProgressApi from '../api/childProgressApi';
import TaskList from './TaskList';
import { LackingAnalysisSection } from './LackingAnalysisSection';
import { GuidanceModal } from './GuidanceModal';
import { TaskGenerationPanel } from './TaskGenerationPanel';
import { LackingArea } from '../api/lackingApi';
import { ScoreRing, DowngradeChips } from './UnifiedBehaviorScore';
import { DashboardOverviewTab, DashboardActivityTab } from './UnifiedDashboardSection';
import { useParentNotificationSocket } from '../hooks/useParentNotificationSocket';
import { getAccessToken } from '../api/auth';

interface ChildCardView extends childProgressApi.ChildOverview {
  needsCheckIn?: boolean;
}

function parseDashboardUpdate(
  payload: unknown
): { childId: number; unified: childProgressApi.UnifiedBehaviorAnalysis } | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as childProgressApi.DashboardUpdatePayload & { data?: Record<string, unknown> };
  const data = p.data;
  if (!data || typeof data !== 'object') return null;

  const childId = typeof data.child_id === 'number' ? data.child_id : null;
  const unified = data.unified_analysis as childProgressApi.UnifiedBehaviorAnalysis | undefined;
  if (childId == null || !unified || typeof unified.overall_score !== 'number') return null;

  const msgType = (p as { type?: string }).type;
  if (msgType && msgType !== 'dashboard_update') return null;

  return { childId, unified };
}

function skillAreasToLackingAreas(
  areas: childProgressApi.SkillAreaItem[]
): LackingArea[] {
  return areas.map((a) => ({
    area: a.area,
    label: a.label,
    score: a.score,
    priority: a.priority === 'high' ? 'high' : 'medium',
    game_type: a.game_type || '',
  }));
}

function getChildStatus(child: ChildCardView) {
  if (child.needsCheckIn) return { label: 'Check-in due', className: 'bg-orange-100 text-orange-700' };
  if (child.needs_attention) return { label: 'Needs attention', className: 'bg-red-100 text-red-700' };
  return { label: 'On track', className: 'bg-green-100 text-green-700' };
}

export function ParentDashboard() {
  const [overview, setOverview] = useState<childProgressApi.AllChildrenOverview | null>(null);
  const [childCards, setChildCards] = useState<ChildCardView[]>([]);
  const [childDashboard, setChildDashboard] = useState<childProgressApi.ChildProgressDashboard | null>(null);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [periodDays, setPeriodDays] = useState(30);

  const [showBehaviorPopup, setShowBehaviorPopup] = useState(false);
  const [selectedChildForCheckIn, setSelectedChildForCheckIn] = useState<number | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [selectedLacking, setSelectedLacking] = useState<LackingArea | null>(null);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadOverview = useCallback(async (days: number) => {
    setLoadingOverview(true);
    try {
      const [overviewData, checkInStatus] = await Promise.all([
        childProgressApi.getAllChildrenOverview(days),
        behaviorApi.getCheckInStatus().catch(() => ({ children: [] as { child_id: number; needs_check_in: boolean }[] })),
      ]);

      const checkInMap = new Map(
        checkInStatus.children.map((c) => [c.child_id, c.needs_check_in])
      );

      setOverview(overviewData);
      const cards: ChildCardView[] = (overviewData.children ?? []).map((child) => ({
        ...child,
        overall_behavior_score: child.overall_behavior_score ?? 0,
        unified_scores: child.unified_scores ?? {},
        downgraded_categories: child.downgraded_categories ?? [],
        engagement_score: child.engagement_score ?? 0,
        needs_attention: child.needs_attention ?? false,
        recent_activities: child.recent_activities ?? {
          behavior_responses: 0,
          games_played: 0,
          tasks_assigned: 0,
          tasks_completed: 0,
        },
        needsCheckIn: checkInMap.get(child.id) ?? false,
      }));
      setChildCards(cards);

      setSelectedChildId((prev) => {
        if (prev && cards.some((c) => c.id === prev)) return prev;
        return cards[0]?.id ?? null;
      });
    } catch (err) {
      console.error('Failed to load overview:', err);
      setOverview(null);
      setChildCards([]);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadChildDashboard = useCallback(async (childId: number, days: number) => {
    setLoadingDashboard(true);
    try {
      const data = await childProgressApi.getChildProgressDashboard(childId, days);
      setChildDashboard(data);
    } catch (err) {
      console.error('Failed to load child dashboard:', err);
      setChildDashboard(null);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const applyUnifiedPatch = useCallback(
    (childId: number, unified: childProgressApi.UnifiedBehaviorAnalysis) => {
      setChildCards((prev) =>
        prev.map((c) =>
          c.id === childId
            ? {
                ...c,
                overall_behavior_score: unified.overall_score ?? 0,
                unified_scores: unified.unified_scores ?? {},
                downgraded_categories: unified.downgraded_categories ?? [],
                needs_attention:
                  c.needsCheckIn ||
                  unified.downgraded_categories.length > 0 ||
                  unified.skill_areas?.requires_attention === true,
              }
            : c
        )
      );

      setChildDashboard((prev) => {
        if (!prev || prev.child_info.id !== childId) return prev;
        return { ...prev, unified_analysis: unified };
      });
    },
    []
  );

  const refreshUnifiedLight = useCallback(
    async (childId: number) => {
      try {
        const unified = await childProgressApi.getChildUnifiedAnalysis(childId, periodDays);
        applyUnifiedPatch(childId, unified);
      } catch (err) {
        console.error('Failed to refresh unified analysis:', err);
      }
    },
    [applyUnifiedPatch, periodDays]
  );

  const handleRealtimeMessage = useCallback(
    (payload: unknown) => {
      const update = parseDashboardUpdate(payload);
      if (update) {
        applyUnifiedPatch(update.childId, update.unified);
        if (selectedChildId === update.childId) {
          void loadChildDashboard(update.childId, periodDays);
        }
        return;
      }

      const wrapped = payload as { type?: string; data?: unknown };
      if (wrapped?.type === 'dashboard_update' && wrapped.data) {
        const inner = parseDashboardUpdate({ type: 'dashboard_update', data: wrapped.data as Record<string, unknown> });
        if (inner) {
          applyUnifiedPatch(inner.childId, inner.unified);
          if (selectedChildId === inner.childId) {
            void refreshUnifiedLight(inner.childId);
          }
        }
      }
    },
    [applyUnifiedPatch, selectedChildId, loadChildDashboard, refreshUnifiedLight, periodDays]
  );

  useParentNotificationSocket({
    token: getAccessToken(),
    enabled: true,
    onMessage: handleRealtimeMessage,
  });

  useEffect(() => {
    void loadOverview(periodDays);

    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setParentId(parsed.parent_id ?? parsed.id ?? 1);
      } catch {
        setParentId(1);
      }
    }

    if (behaviorApi.shouldShowBehaviorPopup() || behaviorApi.shouldShowReminder()) {
      setShowBehaviorPopup(true);
    }
  }, [loadOverview, periodDays]);

  useEffect(() => {
    if (selectedChildId) {
      void loadChildDashboard(selectedChildId, periodDays);
    } else {
      setChildDashboard(null);
    }
  }, [selectedChildId, periodDays, loadChildDashboard]);

  const handleOpenBehaviorCheckIn = (childId?: number) => {
    if (childId) setSelectedChildForCheckIn(childId);
    setShowBehaviorPopup(true);
  };

  const handleCloseBehaviorPopup = () => {
    setShowBehaviorPopup(false);
    setSelectedChildForCheckIn(null);
    void loadOverview(periodDays);
    if (selectedChildId) void loadChildDashboard(selectedChildId, periodDays);
  };

  const handleRefreshAll = async () => {
    await loadOverview(periodDays);
    if (selectedChildId) await loadChildDashboard(selectedChildId, periodDays);
  };

  const handleGetGuidance = (area: LackingArea) => {
    setSelectedLacking(area);
    setShowGuidanceModal(true);
  };

  const handleGenerateTasks = () => {
    setShowGuidanceModal(false);
    setShowTaskPanel(true);
  };

  const selectedChild = childCards.find((c) => c.id === selectedChildId);
  const selectedChildName =
    selectedChild?.name || childDashboard?.child_info.name || '';

  const lackingAreas = childDashboard?.unified_analysis
    ? skillAreasToLackingAreas(childDashboard.unified_analysis.skill_areas?.lacking_areas ?? [])
    : [];

  const ua = childDashboard?.unified_analysis ?? null;
  const weakestCategory = ua?.weakest_category ?? null;
  const weakestScore = weakestCategory ? ua?.unified_scores?.[weakestCategory] ?? null : null;
  const formatCat = (c: string) => c.replace(/_/g, ' ');

  const totalGamesPlayed = childDashboard?.games_summary.total_sessions ?? 0;
  const checkInsDue = childCards.filter((c) => c.needsCheckIn).length;

  const tabStyle = (active: boolean): CSSProperties =>
    active
      ? { backgroundColor: '#2D5F3F', color: '#FFFFFF', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }
      : { backgroundColor: 'transparent', color: '#6B7280' };

  const attentionReasons: string[] = [];
  if (selectedChild?.needsCheckIn) attentionReasons.push('Daily check-in is due');
  if (selectedChild && selectedChild.downgraded_categories.length > 0)
    attentionReasons.push(`Declined: ${selectedChild.downgraded_categories.map(formatCat).join(', ')}`);
  if (weakestCategory && weakestScore != null && weakestScore < 60)
    attentionReasons.push(`Lowest area: ${formatCat(weakestCategory)} (${Math.round(weakestScore)}%)`);
  const showAttention = (selectedChild?.needs_attention ?? false) || attentionReasons.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#FFF8E1] to-white pt-20 lg:pt-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
      {showBehaviorPopup && parentId && (
        <BehaviorTrackingPopup
          parentId={parentId}
          onClose={handleCloseBehaviorPopup}
          preSelectedChildId={selectedChildForCheckIn || undefined}
        />
      )}

      {selectedLacking && selectedChildId && (
        <GuidanceModal
          isOpen={showGuidanceModal}
          onClose={() => setShowGuidanceModal(false)}
          childId={selectedChildId}
          childName={selectedChildName}
          lackingArea={selectedLacking.area}
          lackingLabel={selectedLacking.label}
          score={selectedLacking.score}
          onGenerateTasks={handleGenerateTasks}
        />
      )}

      {selectedLacking && selectedChildId && (
        <TaskGenerationPanel
          isOpen={showTaskPanel}
          onClose={() => setShowTaskPanel(false)}
          childId={selectedChildId}
          childName={selectedChildName}
          lackingArea={selectedLacking.area}
          lackingLabel={selectedLacking.label}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#2D5F3F] text-2xl sm:text-3xl font-semibold">Your Family</h1>
          <p className="text-sm text-gray-600 mt-1">
            A clear view of each child&apos;s behavior, games, and tasks
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodDays.toString()} onValueChange={(v: string) => setPeriodDays(parseInt(v))}>
            <SelectTrigger className="w-28 rounded-xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => void handleRefreshAll()}
            className="rounded-xl"
            disabled={loadingOverview || loadingDashboard}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingOverview ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => handleOpenBehaviorCheckIn()}
            className="bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] hover:from-[#8BD4AE] hover:to-[#A8E6CF] text-[#2D5F3F] rounded-xl font-medium relative"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Daily Check-in
            {checkInsDue > 0 && (
              <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {checkInsDue}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Family summary strip */}
      {overview?.summary && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 rounded-2xl bg-green-50 border-0">
            <p className="text-xs text-gray-600">Activities ({overview.summary.period_days}d)</p>
            <p className="text-2xl font-semibold text-[#2D5F3F]">{overview.summary.total_activities}</p>
          </Card>
          <Card className="p-4 rounded-2xl bg-blue-50 border-0">
            <p className="text-xs text-gray-600">Avg engagement</p>
            <p className="text-2xl font-semibold text-[#1E4F6F]">{Math.round(overview.summary.overall_engagement)}%</p>
          </Card>
          <Card className="p-4 rounded-2xl bg-orange-50 border-0">
            <p className="text-xs text-gray-600">Need attention</p>
            <p className="text-2xl font-semibold text-orange-700">{overview.summary.children_needing_attention}</p>
          </Card>
        </div>
      )}

      {/* Child selector */}
      {loadingOverview ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF]" />
        </div>
      ) : childCards.length === 0 ? (
        <Card className="p-10 rounded-2xl text-center text-gray-600">
          <Users className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <p>No children found. Add children in Settings to get started.</p>
        </Card>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700 mb-2">Select a child</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {childCards.map((child) => {
              const status = getChildStatus(child);
              const isSelected = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left shadow-md ${
                    isSelected
                      ? 'border-[#A8E6CF] bg-white'
                      : 'border-transparent bg-white'
                  }`}
                >
                  <div className="text-center w-10">
                    <p className="text-lg font-semibold text-[#2D5F3F]">{Math.round(child.overall_behavior_score)}</p>
                    <p className="text-xs text-gray-500">score</p>
                  </div>
                  <div className="border-l pl-2">
                    <p className="font-medium text-[#2D5F3F]">{child.name}</p>
                    <p className="text-xs text-gray-500">{child.age ? `${child.age} yrs` : 'Age N/A'}</p>
                  </div>
                  <Badge className={`text-xs ${status.className}`}>{status.label}</Badge>
                </button>
              );
            })}
          </div>

          {selectedChildId && selectedChild && (
            <>
              {/* Child snapshot */}
              <Card className="p-5 sm:p-6 rounded-2xl mb-6 border-[#A8E6CF]/30">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <ScoreRing score={selectedChild.overall_behavior_score} size={96} label="Overall" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-[#2D5F3F]">{selectedChildName}</h2>
                    <p className="text-sm text-gray-600 mb-3">
                      {childDashboard?.child_info.school || '—'}
                      {childDashboard?.child_info.class_name ? ` · ${childDashboard.child_info.class_name}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary">Engagement {Math.round(selectedChild.engagement_score)}%</Badge>
                      <Badge variant="secondary">
                        {selectedChild.recent_activities.games_played} games
                      </Badge>
                      <Badge variant="secondary">
                        {selectedChild.recent_activities.tasks_completed} tasks done
                      </Badge>
                    </div>
                    <DowngradeChips categories={selectedChild.downgraded_categories} />
                  </div>
                </div>

              </Card>

              {/* Attention / focus-area guidance */}
              {showAttention && (
                <Card className="p-4 sm:p-5 rounded-2xl mb-6 bg-orange-50 border-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800">
                          {selectedChildName} needs your attention
                        </p>
                        {attentionReasons.length > 0 ? (
                          <ul className="mt-1 space-y-0.5">
                            {attentionReasons.map((r, i) => (
                              <li key={i} className="text-sm text-gray-700">• {r}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-700">
                            Review the Skills tab to see where to help.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {selectedChild.needsCheckIn && (
                        <Button
                          onClick={() => handleOpenBehaviorCheckIn(selectedChild.id)}
                          className="bg-orange-500 text-white rounded-xl"
                          size="sm"
                        >
                          Check-in
                        </Button>
                      )}
                      <Button
                        onClick={() => setActiveTab('skills')}
                        variant="outline"
                        className="rounded-xl bg-white"
                        size="sm"
                      >
                        View guidance
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tabbed detail — maps to /child-progress/{id}/dashboard sections */}
              {loadingDashboard ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF]" />
                </div>
              ) : childDashboard ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
                  <TabsList className="bg-gray-100 rounded-xl p-1 w-full grid grid-cols-4 gap-1">
                    <TabsTrigger value="overview" style={tabStyle(activeTab === 'overview')} className="rounded-lg text-xs sm:text-sm font-medium">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="skills" style={tabStyle(activeTab === 'skills')} className="rounded-lg text-xs sm:text-sm font-medium">
                      Skills
                    </TabsTrigger>
                    <TabsTrigger value="tasks" style={tabStyle(activeTab === 'tasks')} className="rounded-lg text-xs sm:text-sm font-medium">
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="activity" style={tabStyle(activeTab === 'activity')} className="rounded-lg text-xs sm:text-sm font-medium">
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <DashboardOverviewTab dashboard={childDashboard} />
                  </TabsContent>

                  <TabsContent value="skills">
                    <LackingAnalysisSection
                      childId={selectedChildId}
                      childName={selectedChildName}
                      lackingAreas={lackingAreas}
                      totalGamesPlayed={totalGamesPlayed}
                      onGetGuidance={handleGetGuidance}
                    />
                  </TabsContent>

                  <TabsContent value="tasks">
                    <TaskList
                      childId={selectedChildId}
                      children={childCards.map((c) => ({ id: c.id, name: c.name }))}
                    />
                  </TabsContent>

                  <TabsContent value="activity">
                    <DashboardActivityTab dashboard={childDashboard} />
                  </TabsContent>
                </Tabs>
              ) : (
                <Card className="p-8 rounded-2xl text-center text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Could not load progress data. Try refreshing.
                </Card>
              )}
            </>
          )}
        </>
      )}
      </div>
    </div>
  );
}
