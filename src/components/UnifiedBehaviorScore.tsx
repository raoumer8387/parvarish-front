import { Progress } from './ui/progress';

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export function ScoreRing({ score, size = 88, label, sublabel }: ScoreRingProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0));
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#A8E6CF"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[#2D5F3F]">{Math.round(clamped)}</span>
          <span className="text-[10px] text-gray-500">/ 100</span>
        </div>
      </div>
      {label && <p className="text-sm font-medium text-[#2D5F3F]">{label}</p>}
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
    </div>
  );
}

interface MiniCategoryBarsProps {
  scores?: Record<string, number> | null;
  maxItems?: number;
}

export function MiniCategoryBars({ scores, maxItems = 4 }: MiniCategoryBarsProps) {
  const entries = Object.entries(scores ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxItems);

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400">No category data yet</p>;
  }

  return (
    <div className="space-y-2 w-full">
      {entries.map(([category, value]) => (
        <div key={category}>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-gray-600 capitalize truncate pr-2">{category}</span>
            <span className="text-gray-800 font-medium">{Math.round(value)}%</span>
          </div>
          <Progress value={value} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

interface DowngradeChipsProps {
  categories?: string[] | null;
}

export function DowngradeChips({ categories }: DowngradeChipsProps) {
  if (!categories?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-700 capitalize"
        >
          ↓ {cat}
        </span>
      ))}
    </div>
  );
}
