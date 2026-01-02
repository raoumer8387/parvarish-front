import React from 'react';
import { LackingArea } from '../api/lackingApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Brain, Heart, BookOpen, Users } from 'lucide-react';
import { Progress } from './ui/progress';

interface LackingGaugeProps {
  lackingArea: LackingArea;
  onGetGuidance: () => void;
}

const getColorByScore = (score: number) => {
  if (score < 50) return 'text-red-600 bg-red-50 border-red-200';
  if (score < 60) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-green-600 bg-green-50 border-green-200';
};

const getProgressColor = (score: number) => {
  if (score < 50) return 'bg-red-500';
  if (score < 60) return 'bg-orange-500';
  return 'bg-green-500';
};

const getIcon = (gameType: string) => {
  switch (gameType) {
    case 'memory':
      return <Brain className="h-6 w-6" />;
    case 'mood':
      return <Heart className="h-6 w-6" />;
    case 'islamic_quiz':
      return <BookOpen className="h-6 w-6" />;
    case 'scenario':
      return <Users className="h-6 w-6" />;
    default:
      return <Brain className="h-6 w-6" />;
  }
};

export const LackingGauge: React.FC<LackingGaugeProps> = ({ lackingArea, onGetGuidance }) => {
  const colorClass = getColorByScore(lackingArea.score);
  const progressColor = getProgressColor(lackingArea.score);

  return (
    <Card className={`border-2 ${colorClass}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon(lackingArea.game_type)}
            <CardTitle className="text-lg">{lackingArea.label}</CardTitle>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold">{lackingArea.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Progress value={lackingArea.score} className="h-3" />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all ${progressColor}`}
              style={{ width: `${lackingArea.score}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${lackingArea.priority === 'high' ? 'text-red-600' : 'text-orange-600'}`}>
              {lackingArea.priority === 'high' ? '⚠️ Urgent' : '📊 Needs Attention'}
            </span>
            <span className="text-muted-foreground capitalize">{lackingArea.game_type} Game</span>
          </div>
          
          <Button 
            onClick={onGetGuidance}
            variant={lackingArea.priority === 'high' ? 'destructive' : 'default'}
            className="w-full"
          >
            Get Islamic Guidance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface Child {
  id: number;
  name: string;
}

interface LackingAnalysisSectionProps {
  childId: number;
  childName: string;
  lackingAreas: LackingArea[];
  totalGamesPlayed: number;
  onGetGuidance: (area: LackingArea) => void;
  children?: Child[];
  onChildChange?: (childId: number) => void;
}

export const LackingAnalysisSection: React.FC<LackingAnalysisSectionProps> = ({
  childId,
  childName,
  lackingAreas,
  totalGamesPlayed,
  onGetGuidance,
  children = [],
  onChildChange
}) => {
  // Child selector component
  const childSelector = children.length > 1 && onChildChange ? (
    <div className="flex items-center gap-2 min-w-[200px]">
      <span className="text-sm text-gray-600 whitespace-nowrap">View child:</span>
      <Select value={childId.toString()} onValueChange={(value: string) => onChildChange(parseInt(value))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select child" />
        </SelectTrigger>
        <SelectContent>
          {children.map(child => (
            <SelectItem key={child.id} value={child.id.toString()}>
              {child.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : null;

  // Always show all 4 capability areas, even if backend doesn't flag them as lacking
  const allGameTypes = [
    { area: 'presence_of_mind', label: 'Presence of Mind', game_type: 'memory' },
    { area: 'mood_identification', label: 'Mood Identification', game_type: 'mood' },
    { area: 'learning_capability', label: 'Learning Capability', game_type: 'islamic_quiz' },
    { area: 'behavior_identification', label: 'Behavior Identification', game_type: 'scenario' }
  ];

  // Merge backend lacking areas with all game types
  const displayAreas: LackingArea[] = allGameTypes.map(gameType => {
    const backendArea = lackingAreas.find(la => la.area === gameType.area);
    if (backendArea) {
      return backendArea;
    }
    // If not in lacking_areas, assume good performance (score 70+)
    return {
      area: gameType.area,
      label: gameType.label,
      score: 70, // Default good score
      priority: 'medium' as const,
      game_type: gameType.game_type
    };
  });

  // Show info if no games played yet
  if (totalGamesPlayed === 0) {
    return (
      <div className="space-y-4">
        {childSelector && (
          <div className="flex justify-end">
            {childSelector}
          </div>
        )}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              📊 No Games Played Yet
            </CardTitle>
            <CardDescription>
              {childName} hasn't played any games yet. Scores will appear after playing games.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Capability Analysis for {childName}</h2>
          <p className="text-muted-foreground">
            Based on {totalGamesPlayed} games played • Areas needing attention: {lackingAreas.length}
          </p>
        </div>
        {childSelector}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayAreas.map((area) => (
          <LackingGauge
            key={area.area}
            lackingArea={area}
            onGetGuidance={() => onGetGuidance(area)}
          />
        ))}
      </div>
    </div>
  );
};
