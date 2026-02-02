import React, { useState, useEffect } from 'react';
import { getGuidance, GuidanceResponse } from '../api/lackingApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { BookOpen, Church, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface GuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number | null;
  childName: string;
  lackingArea: string;
  lackingLabel: string;
  score: number;
  onGenerateTasks: () => void;
}

export const GuidanceModal: React.FC<GuidanceModalProps> = ({
  isOpen,
  onClose,
  childId,
  childName,
  lackingArea,
  lackingLabel,
  score,
  onGenerateTasks,
}) => {
  const [guidance, setGuidance] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && childId && lackingArea) {
      loadGuidance();
    }
  }, [isOpen, childId, lackingArea]);

  const loadGuidance = async () => {
    if (!childId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getGuidance(childId, lackingArea);
      setGuidance(data);
    } catch (err: any) {
      console.error('Failed to load guidance:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load guidance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatGuidance = (text: string) => {
    // Split by line breaks and format
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if line contains Quran reference
      if (line.includes('📖') || line.toLowerCase().includes('quran')) {
        return (
          <div key={index} className="flex items-start gap-2 my-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{line}</p>
          </div>
        );
      }
      
      // Check if line contains Hadith/Prophet reference
      if (line.includes('🕌') || line.toLowerCase().includes('prophet') || line.toLowerCase().includes('hadith')) {
        return (
          <div key={index} className="flex items-start gap-2 my-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
            <Church className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{line}</p>
          </div>
        );
      }
      
      // Regular line
      if (line.trim()) {
        return <p key={index} className="my-2">{line}</p>;
      }
      
      return <br key={index} />;
    });
  };

  const handleClose = () => {
    setGuidance(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-3xl w-[90vw] max-h-[85vh] bg-white shadow-2xl overflow-hidden"
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
        <div className="flex flex-col h-full max-h-[85vh]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">
              Islamic Guidance for {childName}
            </DialogTitle>
            <DialogDescription className="text-base">
              {lackingLabel} • Score: {score}/100
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Loading Islamic guidance...</p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {guidance && !loading && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Assalamu Alaikum! Here's personalized Islamic guidance to help {childName} improve.
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                {formatGuidance(guidance.guidance)}
              </div>

              {guidance.islamic_references_used && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-4 mt-4">
                  <BookOpen className="h-4 w-4" />
                  <span>This guidance includes references from Quran and Hadith</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t flex-row gap-3 justify-end">
          <Button variant="outline" onClick={handleClose} className="min-w-[100px]">
            Close
          </Button>
          {guidance && !loading && (
            <Button onClick={onGenerateTasks} className="min-w-[180px]">
              Generate Islamic Tasks
            </Button>
          )}
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
