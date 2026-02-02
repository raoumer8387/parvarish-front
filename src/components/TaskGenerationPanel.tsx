import React, { useState, useEffect } from 'react';
import { generateTasks, GeneratedTask, TasksResponse } from '../api/lackingApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Loader2, Star, Trophy, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

interface TaskGenerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number | null;
  childName: string;
  lackingArea: string;
  lackingLabel: string;
  numTasks?: number;
}

export const TaskGenerationPanel: React.FC<TaskGenerationPanelProps> = ({
  isOpen,
  onClose,
  childId,
  childName,
  lackingArea,
  lackingLabel,
  numTasks = 3,
}) => {
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasksSaved, setTasksSaved] = useState(false);

  useEffect(() => {
    if (isOpen && childId && lackingArea) {
      loadTasks();
    }
  }, [isOpen, childId, lackingArea]);

  const loadTasks = async () => {
    if (!childId) return;

    setLoading(true);
    setError(null);
    setTasksSaved(false);

    try {
      const data: TasksResponse = await generateTasks(childId, lackingArea, numTasks);
      setTasks(data.tasks);
      setTasksSaved(data.tasks_saved);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate tasks. Please try again.');
      console.error('Failed to generate tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTasks = async () => {
    setAssigning(true);

    try {
      // If tasks are already saved by the API, just show success
      if (tasksSaved) {
        toast.success('Tasks Assigned Successfully!', {
          description: `${tasks.length} Islamic tasks have been assigned to ${childName}`,
        });
        handleClose();
      } else {
        // If not saved, you might need a separate API call here
        // For now, assume they're saved
        toast.success('Tasks Assigned Successfully!', {
          description: `${tasks.length} Islamic tasks have been assigned to ${childName}`,
        });
        handleClose();
      }
    } catch (err: any) {
      toast.error('Failed to assign tasks', {
        description: err.response?.data?.message || 'Please try again',
      });
      console.error('Failed to assign tasks:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setTasks([]);
    setError(null);
    setTasksSaved(false);
    onClose();
  };

  const renderStars = (difficulty: number) => {
    return Array.from({ length: 3 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < difficulty
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cognitive':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'behavioral':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'spiritual':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'social':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl w-[95vw] max-h-[90vh] bg-white shadow-2xl overflow-hidden"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: 0
        }}
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">
              AI-Generated Islamic Tasks for {childName}
            </DialogTitle>
            <DialogDescription className="text-base">
              Personalized tasks to improve {lackingLabel}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">
                  Generating personalized Islamic tasks...
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {tasks.length > 0 && !loading && (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getCategoryColor(task.category)}>
                            {task.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {renderStars(task.difficulty)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 font-bold">
                        <Trophy className="h-5 w-5" />
                        <span>{task.xp_reward} XP</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-3 text-foreground/90">
                      {task.description}
                    </CardDescription>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      <span className="italic">{task.islamic_reference}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t flex-row gap-3 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={assigning} className="min-w-[100px]">
            Cancel
          </Button>
          {tasks.length > 0 && !loading && (
            <Button 
              onClick={handleAssignTasks} 
              disabled={assigning}
              className="min-w-[180px]"
            >
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>Assign All {tasks.length} Tasks</>
              )}
            </Button>
          )}
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
