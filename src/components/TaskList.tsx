/**
 * TaskList Component
 * 
 * This component fetches and displays a list of tasks for a given child.
 * It allows switching between 'pending' and 'completed' tasks and provides
 * functionality to mark a pending task as complete.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getTasksForChild, markTaskAsComplete } from '../api/taskApi';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Task {
  id: number;
  child_id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  difficulty: number;
  status: 'pending' | 'completed';
  source: string;
  created_at: string;
}

interface TaskListProps {
  childId: number;
}

const TaskList: React.FC<TaskListProps> = ({ childId }) => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    try {
      const [pending, completed] = await Promise.all([
        getTasksForChild(childId, 'pending'),
        getTasksForChild(childId, 'completed')
      ]);
      setPendingTasks(pending.tasks || []);
      setCompletedTasks(completed.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [childId, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCompleteTask = async (taskId: number) => {
    try {
      await markTaskAsComplete(taskId);
      toast({
        title: 'Success',
        description: 'Task marked as complete!',
      });
      // Refresh tasks
      fetchTasks();
    } catch (error) {
      console.error("Failed to complete task", error);
      toast({
        title: 'Error',
        description: 'Failed to mark task as complete.',
        variant: 'destructive',
      });
    }
  };

  const renderTaskCard = (task: Task, isPending: boolean) => (
    <Card key={task.id} className="mb-4">
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{task.description}</p>
        <div className="mt-2">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
            {task.category}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <span>XP: {task.xp_reward}</span> | <span>Difficulty: {task.difficulty}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Created: {new Date(task.created_at).toLocaleDateString()}
        </p>
        {isPending && (
          <Button className="mt-4" onClick={() => handleCompleteTask(task.id)}>
            Mark as Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Tasks</h2>
        <Tabs defaultValue="pending">
            <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
                {pendingTasks.length > 0 ? (
                    pendingTasks.map(task => renderTaskCard(task, true))
                ) : (
                    <p>No pending tasks.</p>
                )}
            </TabsContent>
            <TabsContent value="completed">
                {completedTasks.length > 0 ? (
                    completedTasks.map(task => renderTaskCard(task, false))
                ) : (
                    <p>No completed tasks.</p>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default TaskList;
