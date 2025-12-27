import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { generateChildTasks } from '../api/taskApi';
import { toast } from 'sonner';

interface Task {
  id: number;
  child_id: number;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  difficulty: number;
  status: 'pending' | 'completed' | 'incomplete';
  source: string;
  meta: {
    chatbot_response: string;
    keywords_detected: string[];
    source_categories: string[];
    low_score_categories: string[];
  };
  created_at: string;
}

interface TaskGenerationProps {
  childId: number | null;
  chatbotResponse: string;
  chatbotTags?: string[];
}

const TaskGeneration: React.FC<TaskGenerationProps> = ({ childId, chatbotResponse, chatbotTags }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleGenerateTasks = async () => {
    if (!childId) {
      toast.error('Please select a child first.');
      return;
    }

    if (chatbotResponse.length < 10) {
        toast.error('Chatbot response is too short.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generateChildTasks({
        child_id: childId,
        chatbot_response: chatbotResponse,
        chatbot_tags: chatbotTags,
      });
      setTasks(data.tasks);
      if (data.count === 0) {
        toast.info('No new tasks were generated for this input.');
      }
    } catch (err) {
      setError('Failed to generate tasks. Please try again.');
      toast.error('Failed to generate tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={handleGenerateTasks} disabled={loading || !childId}>
        {loading ? 'Generating...' : 'Generate Supportive Tasks'}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={task.id}>
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
                <Button disabled className="mt-4" title="Completion tracking coming soon">
                  Mark Completed
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          !loading && tasks.length === 0 && <p>No new tasks generated for this input.</p>
        )}
      </div>
    </div>
  );
};

export default TaskGeneration;
