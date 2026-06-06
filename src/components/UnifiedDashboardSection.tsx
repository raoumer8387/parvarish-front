import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, TrendingUp, TrendingDown, Gamepad2, ListChecks, MessageCircle } from 'lucide-react';
import { ChildProgressDashboard, CategoryChange } from '../api/childProgressApi';
import { ScoreRing } from './UnifiedBehaviorScore';

function barColor(score: number) {
  if (score < 50) return '#EF4444';
  if (score < 70) return '#F59E0B';
  return '#22C55E';
}

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0));
  return (
    <div
      className="w-full rounded-full bg-gray-100 overflow-hidden"
      style={{ height: 8 }}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, backgroundColor: barColor(clamped) }}
      />
    </div>
  );
}

function scoreTextColor(score: number) {
  if (score < 50) return '#DC2626';
  if (score < 70) return '#D97706';
  return '#16A34A';
}

interface UnifiedDashboardSectionProps {
  dashboard: ChildProgressDashboard | null;
  loading: boolean;
  childName: string;
}

function ChangeBadge({ change }: { change?: CategoryChange }) {
  if (change === 'upgraded') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <TrendingUp className="h-3 w-3" />
        Up
      </span>
    );
  }
  if (change === 'downgraded') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
        <TrendingDown className="h-3 w-3" />
        Down
      </span>
    );
  }
  return null;
}

function formatFreshness(iso: string | null | undefined) {
  if (!iso) return 'No activity yet';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatLabel(category: string) {
  return category.replace(/_/g, ' ');
}

export function DashboardOverviewTab({ dashboard }: { dashboard: ChildProgressDashboard }) {
  const {
    unified_analysis: ua,
    behavior_summary,
    games_summary,
    tasks_summary,
    progress_insights,
  } = dashboard;

  if (!ua) {
    return (
      <Card className="p-6 rounded-2xl text-center text-gray-600">
        Complete check-ins, games, or tasks to build a unified score.
      </Card>
    );
  }

  const sources = ua.sources ?? { daily_checkin: {}, games: {}, tasks: {} };
  const dataFreshness = ua.data_freshness ?? { last_check_in: null, last_game: null, last_task: null };
  const categoryChanges = ua.category_changes ?? {};
  const categoryEntries = Object.entries(ua.unified_scores ?? {});

  const sourceCards = [
    { key: 'daily_checkin', label: 'Daily Check-in', icon: MessageCircle, data: sources.daily_checkin ?? {}, freshness: dataFreshness.last_check_in, bg: 'bg-green-50', text: 'text-[#2D5F3F]' },
    { key: 'games', label: 'Games', icon: Gamepad2, data: sources.games ?? {}, freshness: dataFreshness.last_game, bg: 'bg-blue-50', text: 'text-[#1E4F6F]' },
    { key: 'tasks', label: 'Tasks', icon: ListChecks, data: sources.tasks ?? {}, freshness: dataFreshness.last_task, bg: 'bg-yellow-50', text: 'text-[#6B5B00]' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Where the score comes from */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {sourceCards.map(({ key, label, icon: Icon, data, freshness, bg, text }) => {
          const values = Object.values(data);
          const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          return (
            <Card key={key} className={`p-4 rounded-2xl border-0 ${bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${text}`} />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <p className={`text-2xl font-semibold ${text}`}>{Math.round(avg)}%</p>
              <p className="text-xs text-gray-500 mt-1">{formatFreshness(freshness)}</p>
            </Card>
          );
        })}
      </div>

      {/* Category scores */}
      <Card className="p-5 sm:p-6 rounded-2xl">
        <h3 className="text-gray-800 font-semibold mb-5">Behavior Categories</h3>
        {categoryEntries.length > 0 ? (
          <div className="space-y-4">
            {[...categoryEntries]
              .sort(([, a], [, b]) => b - a)
              .map(([category, score]) => {
                const change = categoryChanges[category];
                const rounded = Math.round(score);
                return (
                  <div key={category} className="behavior-category-row">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium capitalize text-gray-800">
                          {formatLabel(category)}
                        </span>
                        <ChangeBadge change={change} />
                      </div>
                      <span
                        className="text-sm font-semibold shrink-0 ml-3"
                        style={{ color: scoreTextColor(rounded) }}
                      >
                        {rounded}%
                      </span>
                    </div>
                    <ScoreBar score={score} />
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No category scores yet.</p>
        )}
        {(ua.strongest_category || ua.weakest_category) && (
          <div
            className="flex flex-wrap gap-3 mt-5 pt-5 border-t"
            style={{ borderColor: '#E5E7EB' }}
          >
            {ua.strongest_category && (
              <span
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
              >
                <strong>Strongest</strong>
                <span className="capitalize">{formatLabel(ua.strongest_category)}</span>
              </span>
            )}
            {ua.weakest_category && (
              <span
                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#FFEDD5', color: '#9A3412' }}
              >
                <strong>Needs work</strong>
                <span className="capitalize">{formatLabel(ua.weakest_category)}</span>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 rounded-2xl border-0 bg-green-50">
          <p className="text-xs text-gray-600">Check-in</p>
          <p className="text-lg font-semibold text-[#2D5F3F]">
            {behavior_summary.needs_check_in
              ? 'Due today'
              : Number.isFinite(behavior_summary.stats.avg_score)
                ? `${Math.round(behavior_summary.stats.avg_score)}%`
                : '—'}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl border-0 bg-blue-50">
          <p className="text-xs text-gray-600">Games played</p>
          <p className="text-lg font-semibold text-[#1E4F6F]">{games_summary.total_sessions}</p>
        </Card>
        <Card className="p-4 rounded-2xl border-0 bg-yellow-50">
          <p className="text-xs text-gray-600">Tasks done</p>
          <p className="text-lg font-semibold text-[#6B5B00]">
            {tasks_summary.completed_tasks}/{tasks_summary.total_tasks}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl border-0 bg-indigo-50">
          <p className="text-xs text-gray-600">Engagement</p>
          <p className="text-lg font-semibold text-blue-700">
            {Math.round(progress_insights?.overall_engagement_score ?? 0)}%
          </p>
        </Card>
      </div>

      {/* Recommendations */}
      {(progress_insights?.recommendations?.length ?? 0) > 0 && (
        <Card className="p-5 rounded-2xl bg-green-50 border-0">
          <h3 className="text-gray-800 font-medium mb-3">What to do next</h3>
          <ul className="space-y-2">
            {(progress_insights?.recommendations ?? []).map((rec, i) => (
              <li key={i} className="text-sm text-gray-700">
                <strong>{rec.title}:</strong> {rec.description}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Insights */}
      {(progress_insights?.insights?.length ?? 0) > 0 && (
        <Card className="p-5 rounded-2xl">
          <h3 className="text-gray-800 font-medium mb-3">Insights</h3>
          <ul className="space-y-2">
            {(progress_insights?.insights ?? []).map((insight, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span>
                  {insight.type === 'improvement' ? '📈' : insight.type === 'concern' ? '⚠️' : '💡'}
                </span>
                <span>{insight.message}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function DashboardActivityTab({ dashboard }: { dashboard: ChildProgressDashboard }) {
  const { recent_activity = [] } = dashboard;

  if (recent_activity.length === 0) {
    return (
      <Card className="p-8 rounded-2xl text-center text-gray-600">
        No recent activity yet. Encourage your child to play games or complete tasks.
      </Card>
    );
  }

  return (
    <Card className="p-5 rounded-2xl">
      <h3 className="text-gray-800 font-medium mb-3">Recent Activity</h3>
      <div className="space-y-2">
        {recent_activity.slice(0, 12).map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
              item.type === 'behavior' ? 'bg-green-50' : item.type === 'game' ? 'bg-blue-50' : 'bg-yellow-50'
            }`}
          >
            <span>{item.type === 'behavior' ? '🎯' : item.type === 'game' ? '🎮' : '📝'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800">{item.title}</p>
              {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
              <p className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</p>
            </div>
            {item.score != null && (
              <Badge className="bg-[#A8E6CF] text-[#2D5F3F] shrink-0">{Math.round(item.score)}%</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function UnifiedDashboardSection({ dashboard, loading, childName }: UnifiedDashboardSectionProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#A8E6CF]" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Card className="p-8 rounded-3xl text-center text-gray-600">
        Select a child to view their progress.
      </Card>
    );
  }

  const ua = dashboard.unified_analysis;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#2D5F3F] text-xl sm:text-2xl font-semibold">{childName}&apos;s Progress</h2>
          <p className="text-sm text-gray-600">Last {dashboard.period_days} days</p>
        </div>
        {ua && <ScoreRing score={ua.overall_score ?? 0} label="Overall Score" />}
      </div>
      <DashboardOverviewTab dashboard={dashboard} />
    </div>
  );
}
