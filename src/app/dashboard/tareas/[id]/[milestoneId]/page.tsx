'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  ClipboardCheck,
  CheckCircle,
  Circle,
  MessageSquare,
  ArrowDownUp,
  Calendar as CalendarIcon,
  LayoutGrid,
  FilterX,
  Paperclip,
  FileText,
  ImageIcon,
  Download,
  Check,
  Plus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  projects,
  type Project,
  type Milestone,
  type ProjectTask,
  type Comment,
  type Attachment,
  staff,
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const getPriorityVariant = (priority: ProjectTask['priority']) => {
  switch (priority) {
    case 'Alta':
      return 'destructive';
    case 'Media':
      return 'default';
    case 'Baja':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getAssigneeAvatar = (assigneeName: string) => {
  const user = staff.find((s) => s.name === assigneeName);
  return user
    ? user.avatarUrl
    : 'https://picsum.photos/seed/avatar-fallback/40/40';
};

function MilestoneDetailClient({ project, initialMilestone }: { project: Project, initialMilestone: Milestone }) {
  const [milestone, setMilestone] = useState<Milestone>(initialMilestone);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  const handleTaskToggle = (taskId: string) => {
    setMilestone((currentMilestone) => {
      const updatedTasks = currentMilestone.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      return { ...currentMilestone, tasks: updatedTasks };
    });
  };

  const handleSort = useCallback((sort: 'dueDate' | 'priority') => {
    setSortBy(sort);
    setMilestone((currentMilestone) => {
      const priorityOrder = { Alta: 1, Media: 2, Baja: 3 };
      const sortedTasks = [...currentMilestone.tasks].sort((a, b) => {
        if (sort === 'priority') {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      return { ...currentMilestone, tasks: sortedTasks };
    });
  }, []);

  const { tasks } = milestone;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/tareas/${project.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{milestone.title}</h1>
            <CardDescription>{milestone.description}</CardDescription>
          </div>
        </div>
        <Button><PlusCircle className="mr-2 h-4 w-4" />Agregar Tarea</Button>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
            <div>
                <CardTitle>Lista de Tareas</CardTitle>
                <CardDescription>
                Todas las tareas asignadas a este hito.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <Button variant={sortBy === 'dueDate' ? 'secondary' : 'outline'} size="sm" onClick={() => handleSort('dueDate')}>
                    <CalendarIcon className="mr-2 h-4 w-4" /> Fecha
                </Button>
                <Button variant={sortBy === 'priority' ? 'secondary' : 'outline'} size="sm" onClick={() => handleSort('priority')}>
                    <ArrowDownUp className="mr-2 h-4 w-4" /> Prioridad
                </Button>
            </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
            {tasks.map((task) => (
                <Link key={task.id} href={`/dashboard/tareas/${project.id}/${milestone.id}/${task.id}`} className="block">
                    <div
                        className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50"
                        )}
                    >
                        <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleTaskToggle(task.id);
                            }}
                            className="mt-1"
                        />
                        <div className="grid flex-1 gap-1.5 leading-none">
                        <label
                            htmlFor={`task-${task.id}`}
                            className={cn(
                            'cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                            task.completed && 'text-muted-foreground line-through'
                            )}
                        >
                            {task.title}
                        </label>
                        <p className="text-sm text-muted-foreground">Vence: {task.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                        <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={getAssigneeAvatar(task.assignedTo)} />
                            <AvatarFallback>{task.assignedTo.charAt(0)}</AvatarFallback>
                        </Avatar>
                        </div>
                    </div>
                </Link>
            ))}
            </div>
        </CardContent>
        </Card>
    </div>
  );
}

export default function MilestoneDetailPage({ params }: { params: { id: string, milestoneId: string } }) {
    const project = projects.find((p) => p.id === params.id);
    const milestone = project?.milestones.find(m => m.id === params.milestoneId);
  
    if (!project || !milestone) {
      return (
        <div className="text-center">
          <p className="text-lg">Hito no encontrado</p>
          <Button asChild className="mt-4">
            <Link href={`/dashboard/tareas/${params.id}`}>Volver al Proyecto</Link>
          </Button>
        </div>
      );
    }
  
    return <MilestoneDetailClient project={project} initialMilestone={milestone} />;
}
