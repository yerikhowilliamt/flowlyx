'use client';

import React, { useState } from 'react';
import { useCalendarTasks } from '../hooks/use-calendar';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { getPriorities } from '@/features/boards/api/boards.api';
import { useQueries } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Filter, Loader2, ListTodo, AlertCircle } from 'lucide-react';
import { TaskResponse, PrioritySummary } from '@/features/boards/types/board.types';

interface WorkspaceCalendarProps {
  workspaceId: string;
}

// Helper to format date to YYYY-MM-DD
const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function WorkspaceCalendar({ workspaceId }: WorkspaceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Define date range to fetch: from 10 days before the month start to 10 days after the month end
  const startFetchDate = new Date(year, month - 1, 20);
  startFetchDate.setHours(0, 0, 0, 0);
  const endFetchDate = new Date(year, month + 1, 10);
  endFetchDate.setHours(23, 59, 59, 999);

  // Fetch tasks
  const { data: tasks, isLoading: isTasksLoading } = useCalendarTasks({
    workspaceId,
    startDate: startFetchDate.toISOString(),
    endDate: endFetchDate.toISOString(),
    projectId: selectedProjectId === 'all' ? undefined : selectedProjectId,
  });

  // Fetch projects for filter
  const { data: projects } = useProjects(workspaceId);

  // Fetch priorities for all projects in the workspace in parallel
  const prioritiesQueries = useQueries({
    queries: (projects || []).map((project) => ({
      queryKey: ['priorities', { projectId: project.id }],
      queryFn: () => getPriorities(project.id),
      enabled: !!project.id,
    })),
  });

  const priorities = React.useMemo(() => {
    const list: PrioritySummary[] = [];
    prioritiesQueries.forEach((q) => {
      if (q.data?.data) {
        list.push(...q.data.data);
      }
    });
    return list;
  }, [prioritiesQueries]);

  // Map tasks to their dates
  const tasksByDate: Record<string, TaskResponse[]> = {};
  if (tasks) {
    tasks.forEach((task) => {
      const dateStr = task.dueDate || task.startDate;
      if (dateStr) {
        const key = formatDateKey(new Date(dateStr));
        if (!tasksByDate[key]) {
          tasksByDate[key] = [];
        }
        tasksByDate[key].push(task);
      }
    });
  }

  // Filter tasks for the currently selected day
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDayTasks = tasksByDate[selectedDateKey] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Left Column: Calendar Date Picker & Project Filter */}
      <div className="md:col-span-5 space-y-6">
        <Card className="border-zinc-900 bg-zinc-950/40 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              <span>Calendar Navigation</span>
              {isTasksLoading && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
            </CardTitle>
            <CardDescription className="text-xs">
              Filter by project and choose a date to display tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project Filter */}
            <div className="flex items-center gap-x-2">
              <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
              <Select
                value={selectedProjectId}
                onValueChange={(val) => setSelectedProjectId(val || 'all')}
              >
                <SelectTrigger className="w-full border-zinc-800 bg-zinc-950 text-zinc-200 text-xs">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-200">
                  <SelectItem value="all" className="text-xs">
                    All Projects
                  </SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="text-xs">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shadcn Calendar Component */}
            <div className="flex justify-center p-2 rounded-xl bg-zinc-950/80 border border-zinc-900/50">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                onMonthChange={setCurrentMonth}
                className="w-full"
                modifiers={{
                  hasTasks: (date) => {
                    const key = formatDateKey(date);
                    return !!tasksByDate[key]?.length;
                  },
                }}
                modifiersClassNames={{
                  hasTasks:
                    'relative font-bold text-orange-500 after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-orange-500',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Task List for Selected Day */}
      <div className="md:col-span-7">
        <Card className="border-zinc-900 bg-zinc-950/40 shadow-xl min-h-[432px] flex flex-col">
          <CardHeader className="border-b border-zinc-900 pb-4">
            <CardTitle className="text-base font-bold text-white flex items-center justify-between">
              <span>
                Tasks for {selectedDate.toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
              <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task' : 'tasks'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              List of active tasks scheduled for this day.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-6">
            {selectedDayTasks.length === 0 ? (
              <Empty className="flex-1 border-dashed border-zinc-900 bg-zinc-950/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarIcon className="h-5 w-5 text-zinc-500" />
                  </EmptyMedia>
                  <EmptyTitle className="text-white">No Tasks Scheduled</EmptyTitle>
                  <EmptyDescription className="text-zinc-500">
                    There are no tasks due or starting on this date. Choose another date or add
                    tasks to your boards.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ScrollArea className="flex-1 max-h-[340px]">
                <div className="space-y-3 pr-4">
                  {selectedDayTasks.map((task) => {
                    const taskPriority = priorities.find((p) => p.id === task.priorityId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="group flex flex-col p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-800 transition-all cursor-pointer text-left space-y-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-x-4">
                          <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors leading-tight">
                            {task.title}
                          </h4>
                          {taskPriority && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold px-2 py-0.5 rounded border h-fit shrink-0"
                              style={{
                                backgroundColor: `${taskPriority.color}10`,
                                color: taskPriority.color,
                                borderColor: `${taskPriority.color}25`,
                              }}
                            >
                              {taskPriority.name}
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-x-4 text-3xs font-semibold text-zinc-500 pt-1">
                          <span className="bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/50">
                            Status: <span className="text-zinc-300">{task.status}</span>
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-x-1">
                              <AlertCircle className="h-3 w-3 text-orange-500/80" />
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl shadow-2xl">
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-center gap-x-2 text-orange-500">
                <ListTodo className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Task Details</span>
              </div>
              <DialogTitle className="text-xl font-extrabold text-white tracking-tight leading-snug">
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-xs">
                View properties and status of this task.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest">
                  Description
                </span>
                <p className="text-xs text-zinc-300 bg-zinc-900/40 border border-zinc-900/60 p-3 rounded-xl min-h-[60px] leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest block">
                    Status
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-full bg-zinc-900 border-zinc-850 px-2 py-0.5 text-2xs font-semibold text-zinc-400 h-fit"
                  >
                    {selectedTask.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest block">
                    Priority
                  </span>
                  {(() => {
                    const taskPriority = priorities.find((p) => p.id === selectedTask.priorityId);
                    return taskPriority ? (
                      <Badge
                        variant="outline"
                        className="rounded-full px-2 py-0.5 text-2xs font-semibold border h-fit"
                        style={{
                          backgroundColor: `${taskPriority.color}15`,
                          color: taskPriority.color,
                          borderColor: `${taskPriority.color}30`,
                        }}
                      >
                        {taskPriority.name}
                      </Badge>
                    ) : (
                      <span className="text-zinc-600 text-2xs italic">None</span>
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest block">
                    Start Date
                  </span>
                  <div className="flex items-center gap-x-1.5 text-zinc-400">
                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      {selectedTask.startDate
                        ? new Date(selectedTask.startDate).toLocaleDateString()
                        : 'Not set'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-3xs font-bold text-zinc-500 uppercase tracking-widest block">
                    Due Date
                  </span>
                  <div className="flex items-center gap-x-1.5 text-zinc-400">
                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      {selectedTask.dueDate
                        ? new Date(selectedTask.dueDate).toLocaleDateString()
                        : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-900/60">
              <Button
                onClick={() => setSelectedTask(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
