/**
 * TaskList Component
 * 
 * This component fetches and displays a list of tasks for a given child.
 * It allows switching between 'pending' and 'completed' tasks and provides
 * functionality to mark a pending task as complete.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getTasksForChild, updateTaskStatus, getAllTasks } from '../api/taskApi';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Clock, User } from 'lucide-react';

interface Task {
  id: number;
  child_id: number;
  child_name?: string;
  title: string;
  description?: string;
  category?: string;
  xp_reward?: number;
  difficulty?: number;
  status: 'pending' | 'completed' | 'incomplete';
  created_at?: string;
  completed_at?: string;
}

interface Child {
  id: number;
  name: string;
}

interface TaskListProps {
  childId: number;
  children?: Child[];
}

const TaskList: React.FC<TaskListProps> = ({ childId, children = [] }) => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');

  const fetchTasks = useCallback(async () => {
    if (!childId && selectedChildFilter === 'all') return;
    setLoading(true);
    try {
      if (selectedChildFilter === 'all') {
        // Fetch all tasks across all children
        const [allPending, allCompleted, allIncomplete] = await Promise.all([
          getAllTasks({ status: 'pending' }),
          getAllTasks({ status: 'completed' }),
          getAllTasks({ status: 'incomplete' })
        ]);
        setPendingTasks(allPending.tasks || []);
        setCompletedTasks(allCompleted.tasks || []);
        setIncompleteTasks(allIncomplete.tasks || []);
      } else {
        // Fetch tasks for specific child
        const targetChildId = selectedChildFilter === 'current' ? childId : parseInt(selectedChildFilter);
        const [childPending, childCompleted, childIncomplete] = await Promise.all([
          getTasksForChild(targetChildId, 'pending'),
          getTasksForChild(targetChildId, 'completed'),
          getTasksForChild(targetChildId, 'incomplete')
        ]);
        setPendingTasks(childPending.tasks || []);
        setCompletedTasks(childCompleted.tasks || []);
        setIncompleteTasks(childIncomplete.tasks || []);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [childId, selectedChildFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdateTaskStatus = async (taskId: number, status: 'completed' | 'incomplete' | 'pending', statusLabel: string) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success(`Task marked as ${statusLabel}!`);
      // Refresh tasks
      fetchTasks();
    } catch (error) {
      console.error(`Failed to update task status to ${status}`, error);
      toast.error(`Failed to mark task as ${statusLabel}.`);
    }
  };

  const renderTaskCard = (task: Task, status: 'pending' | 'completed' | 'incomplete') => (
    <Card key={task.id} className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <span className="flex-1">{task.title}</span>
          {status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
          {status === 'incomplete' && <XCircle className="h-5 w-5 text-red-600" />}
          {status === 'pending' && <Clock className="h-5 w-5 text-orange-600" />}
        </CardTitle>
        {task.child_name && (
          <div className="flex items-center gap-2 mt-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">{task.child_name}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p>{task.description}</p>
        <div className="mt-2">
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
            {task.category}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <span>XP: {task.xp_reward || 0}</span> | <span>Difficulty: {task.difficulty || 1}</span>
        </div>
        {task.created_at && (
          <p className="text-xs text-gray-400 mt-1">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </p>
        )}
        {status === 'pending' && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant="default"
              style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
              className="hover:bg-green-700 border-0"
              onClick={() => handleUpdateTaskStatus(task.id, 'completed', 'complete')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
            <Button 
              variant="outline" 
              style={{ borderColor: '#dc2626', color: '#dc2626', backgroundColor: '#ffffff' }}
              className="hover:bg-red-50" 
              onClick={() => handleUpdateTaskStatus(task.id, 'incomplete', 'incomplete')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Mark Incomplete
            </Button>
          </div>
        )}
        {(status === 'completed' || status === 'incomplete') && (
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => handleUpdateTaskStatus(task.id, 'pending', 'pending')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Move to Pending
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Tasks</h2>
          {children.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter by:</span>
              <Select value={selectedChildFilter} onValueChange={setSelectedChildFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Children</SelectItem>
                  <SelectItem value="current">Current Child</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Tabs defaultValue="pending">
            <TabsList>
                <TabsTrigger value="pending">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending ({pendingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completed ({completedTasks.length})
                </TabsTrigger>
                <TabsTrigger value="incomplete">
                  <XCircle className="h-4 w-4 mr-2" />
                  Incomplete ({incompleteTasks.length})
                </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
                {pendingTasks.length > 0 ? (
                    pendingTasks.map(task => renderTaskCard(task, 'pending'))
                ) : (
                    <p className="text-gray-500 py-8 text-center">No pending tasks.</p>
                )}
            </TabsContent>
            <TabsContent value="completed">
                {completedTasks.length > 0 ? (
                    completedTasks.map(task => renderTaskCard(task, 'completed'))
                ) : (
                    <p className="text-gray-500 py-8 text-center">No completed tasks.</p>
                )}
            </TabsContent>
            <TabsContent value="incomplete">
                {incompleteTasks.length > 0 ? (
                    incompleteTasks.map(task => renderTaskCard(task, 'incomplete'))
                ) : (
                    <p className="text-gray-500 py-8 text-center">No incomplete tasks.</p>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default TaskList;
