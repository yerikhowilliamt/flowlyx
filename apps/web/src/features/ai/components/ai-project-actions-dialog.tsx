'use client';

import { useState } from 'react';
import { Loader2, Sparkles, FileText, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAiProjectSummary, useAiSprintPlan } from '../hooks/use-ai';

interface AiProjectActionsDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiProjectActionsDialog({ projectId, projectName, open, onOpenChange }: AiProjectActionsDialogProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'sprint'>('summary');
  const [result, setResult] = useState<string | null>(null);

  const summaryMutation = useAiProjectSummary();
  const sprintMutation = useAiSprintPlan();

  const handleGenerateSummary = () => {
    setResult(null);
    summaryMutation.mutate(
      { projectId, includeStats: true, focusArea: 'all' },
      {
        onSuccess: (res: unknown) => {
          const r = res as { summary?: string; data?: { summary?: string } };
          setResult(r?.summary || r?.data?.summary || JSON.stringify(res, null, 2));
        }
      }
    );
  };

  const handleGenerateSprint = () => {
    setResult(null);
    sprintMutation.mutate(
      { projectId, sprintDurationDays: 14, maxTasksPerSprint: 10, focusArea: 'all' },
      {
        onSuccess: (res: unknown) => {
          const r = res as { plan?: string; data?: { plan?: string } };
          setResult(r?.plan || r?.data?.plan || JSON.stringify(res, null, 2));
        }
      }
    );
  };

  const isPending = summaryMutation.isPending || sprintMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="text-left space-y-1 pb-4 border-b border-zinc-900 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              AI Tools: {projectName}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-zinc-400">
            Generate intelligent insights and plans using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 p-4 border-b border-zinc-900 shrink-0">
          <Button
            variant="ghost"
            onClick={() => { setActiveTab('summary'); setResult(null); }}
            className={`flex-1 ${activeTab === 'summary' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <FileText className="mr-2 h-4 w-4" />
            Project Summary
          </Button>
          <Button
            variant="ghost"
            onClick={() => { setActiveTab('sprint'); setResult(null); }}
            className={`flex-1 ${activeTab === 'sprint' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Sprint Planning
          </Button>
        </div>

        <div className="p-6 overflow-y-auto grow bg-zinc-900/20">
          {!result && !isPending && (
            <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
              <div className="rounded-full bg-zinc-900 p-4">
                <Sparkles className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
              <p className="text-sm text-zinc-400 max-w-sm">
                {activeTab === 'summary' 
                  ? "Generate a comprehensive summary of project progress, risks, and blockers." 
                  : "Generate a suggested sprint plan based on project velocity and priorities."}
              </p>
              <Button
                onClick={activeTab === 'summary' ? handleGenerateSummary : handleGenerateSprint}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {activeTab === 'summary' ? 'Summary' : 'Sprint Plan'}
              </Button>
            </div>
          )}

          {isPending && (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-sm text-zinc-400 animate-pulse">
                {activeTab === 'summary' ? 'Analyzing project data...' : 'Planning next sprint...'}
              </p>
            </div>
          )}

          {result && !isPending && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Generated {activeTab === 'summary' ? 'Summary' : 'Plan'}</h4>
                <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="h-7 text-xs text-zinc-400 hover:text-white">
                  Clear
                </Button>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {result}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
