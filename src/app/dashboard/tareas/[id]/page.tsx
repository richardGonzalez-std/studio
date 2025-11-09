'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PlusCircle,
  ListTodo,
  ClipboardCheck,
  CheckCircle,
  Circle,
  MessageSquare,
  ArrowDownUp,
  Calendar,
  LayoutGrid,
  FilterX,
  Paperclip,
  FileText,
  ImageIcon,
  Download,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { projects, type Project, type Milestone, type ProjectTask, type Comment, type Attachment, staff } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

/**
 * Componente que representa un único hito (Milestone) en el plan del proyecto.
 * Ahora muestra un resumen y es clicable para ver las tareas.
 */
const MilestoneSummaryCard = React.memo(function MilestoneSummaryCard({
  milestone,
  onMilestoneSelect,
}: {
  milestone: Milestone;
  onMilestoneSelect: () => void;
}) {
  const completedTasks = useMemo(
    () => milestone.tasks.filter((task) => task.completed).length,
    [milestone.tasks]
  );
  const totalTasks = milestone.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isCompleted = progress === 100;

  return (
    <Card
      onClick={onMilestoneSelect}
      className="cursor-pointer transition-all hover:ring-2 hover:ring-primary/50"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle
            className={cn(
              'flex items-center gap-2 text-lg',
              isCompleted && 'text-muted-foreground'
            )}
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-primary" />
            )}
            {milestone.title}
          </CardTitle>
          <Badge variant={isCompleted ? 'secondary' : 'default'}>
            {milestone.days}
          </Badge>
        </div>
        <CardDescription>{milestone.description}</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <span>
              {completedTasks} de {totalTasks} tareas
            </span>
          </div>
          <Progress
            value={progress}
            aria-label={`Progreso del hito: ${progress.toFixed(0)}%`}
          />
      </CardContent>
    </Card>
  );
});


const getAssigneeAvatar = (assigneeName: string) => {
    const user = staff.find(s => s.name === assigneeName);
    return user ? user.avatarUrl : 'https://picsum.photos/seed/avatar-fallback/40/40';
}

const getFileIcon = (type: Attachment['type']) => {
    switch(type) {
        case 'image': return <ImageIcon className="h-5 w-5 text-primary" />;
        case 'pdf': return <FileText className="h-5 w-5 text-destructive" />;
        default: return <Paperclip className="h-5 w-5 text-muted-foreground" />;
    }
}

/**
 * Componente de cliente que maneja la lógica y el estado de la página de detalle del proyecto.
 */
function ProjectDetailClient({ initialProject }: { initialProject: Project | undefined }) {
  const [project, setProject] = useState<Project | undefined>(initialProject);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [activeTab, setActiveTab] = useState('hitos');
  const [filteredMilestoneId, setFilteredMilestoneId] = useState<string | null>(null);

  const handleTaskToggle = (milestoneId: string, taskId: string) => {
    setProject((currentProject) => {
      if (!currentProject) return undefined;
      const updatedMilestones = currentProject.milestones.map((milestone) => {
        if (milestone.id === milestoneId) {
          const updatedTasks = milestone.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          });
          return { ...milestone, tasks: updatedTasks };
        }
        return milestone;
      });
      return { ...currentProject, milestones: updatedMilestones };
    });
  };

  const handleSelectTask = (task: ProjectTask) => {
    setSelectedTask(task);
    setNewComment('');
  };

  const handleDialogClose = () => {
    setSelectedTask(null);
  };
  
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;
    
    const comment: Comment = {
      id: `C${Date.now()}`,
      author: 'Usuario Admin',
      avatarUrl: 'https://picsum.photos/seed/admin-avatar/40/40',
      text: newComment,
      timestamp: new Date().toLocaleString('es-CR'),
    };

    setProject(currentProject => {
        if (!currentProject) return;

        const updatedMilestones = currentProject.milestones.map(m => ({
            ...m,
            tasks: m.tasks.map(t => {
                if (t.id === selectedTask.id) {
                    const updatedTask = { ...t, comments: [...(t.comments || []), comment] };
                    setSelectedTask(updatedTask);
                    return updatedTask;
                }
                return t;
            })
        }));

        return { ...currentProject, milestones: updatedMilestones };
    });

    setNewComment('');
  };

  const handleSort = useCallback((sort: 'dueDate' | 'priority') => {
    setSortBy(sort);
    setProject(currentProject => {
        if (!currentProject) return;
        const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
        const sortedMilestones = currentProject.milestones.map(milestone => {
            const sortedTasks = [...milestone.tasks].sort((a, b) => {
                if (sort === 'priority') {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
            return { ...milestone, tasks: sortedTasks };
        });
        return { ...currentProject, milestones: sortedMilestones };
    });
  }, []);

  const handleMilestoneSelect = (milestoneId: string) => {
    setActiveTab('tareas');
    setFilteredMilestoneId(milestoneId);
  }

  const allTasks = useMemo(() => {
    if (!project) return [];
    let tasks = project.milestones.flatMap(m => m.tasks.map(t => ({ ...t, milestoneTitle: m.title, milestoneId: m.id })));
    if(filteredMilestoneId) {
        tasks = tasks.filter(t => t.milestoneId === filteredMilestoneId);
    }
    return tasks;
  }, [project, filteredMilestoneId]);

  const overallProgress = useMemo(() => {
    if (!project) return 0;
    const totalTasks = project.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
    if (totalTasks === 0) return 0;
    const completedTasks = project.milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.completed).length, 0);
    return (completedTasks / totalTasks) * 100;
  }, [project]);


  if (!project) {
    return (
      <div className="text-center">
        <p className="text-lg">Proyecto no encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/tareas">Volver a Proyectos</Link>
        </Button>
      </div>
    );
  }

  return (
     <Dialog onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/tareas">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={project.leaderAvatar} />
                    <AvatarFallback>{project.leader.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Liderado por {project.leader}</span>
              </div>
            </div>
          </div>
           <div className="flex items-center gap-2">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Hito
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Tarea
            </Button>
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Resumen del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h3 className="font-medium text-muted-foreground">Progreso Total</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Progress value={overallProgress} className="h-2 w-full" />
                        <span className="text-sm font-semibold">{overallProgress.toFixed(0)}%</span>
                    </div>
                </div>
                 <div>
                    <h3 className="font-medium text-muted-foreground">Presupuesto</h3>
                    <p className="font-semibold text-lg">${project.budget.toLocaleString('en-US')}</p>
                </div>
                <div>
                    <h3 className="font-medium text-muted-foreground">Fechas Clave</h3>
                    <p className="text-sm">Inicio: {project.startDate} | Fin: {project.endDate}</p>
                </div>
            </CardContent>
        </Card>

         <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="hitos" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Hitos
            </TabsTrigger>
            <TabsTrigger value="tareas" className="gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Todas las Tareas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="hitos">
             <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {project.milestones.map((milestone) => (
                    <MilestoneSummaryCard
                    key={milestone.id}
                    milestone={milestone}
                    onMilestoneSelect={() => handleMilestoneSelect(milestone.id)}
                    />
                ))}
                </div>
          </TabsContent>
          <TabsContent value="tareas">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Lista de Tareas</CardTitle>
                                <CardDescription>
                                    {filteredMilestoneId 
                                        ? `Viendo tareas del hito: ${project.milestones.find(m => m.id === filteredMilestoneId)?.title}`
                                        : 'Todas las tareas del proyecto.'
                                    }
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {filteredMilestoneId && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilteredMilestoneId(null)}>
                                        <FilterX className="mr-2 h-4 w-4"/>
                                        Limpiar Filtro
                                    </Button>
                                )}
                                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                                <Button variant={sortBy === 'dueDate' ? 'secondary' : 'outline'} size="sm" onClick={() => handleSort('dueDate')}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Fecha
                                </Button>
                                <Button variant={sortBy === 'priority' ? 'secondary' : 'outline'} size="sm" onClick={() => handleSort('priority')}>
                                    <ArrowDownUp className="mr-2 h-4 w-4" />
                                    Prioridad
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-3">
                            {allTasks.map((task) => (
                                <DialogTrigger key={task.id} asChild>
                                <div
                                    onClick={() => handleSelectTask(task)}
                                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50"
                                >
                                    <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.completed}
                                    onClick={(e) => e.stopPropagation()} // Evita que el click en el checkbox dispare el click del div
                                    onCheckedChange={() => {
                                        handleTaskToggle(task.milestoneId, task.id);
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
                                        <p className="text-sm text-muted-foreground">
                                            Vence: {task.dueDate}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={getAssigneeAvatar(task.assignedTo)} />
                                            <AvatarFallback>{task.assignedTo.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                                </DialogTrigger>
                            ))}
                        </div>
                    </CardContent>
                </Card>
          </TabsContent>
        </Tabs>
      </div>
       {selectedTask && (
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedTask.title}</DialogTitle>
                    <DialogDescription>
                        Vence: {selectedTask.dueDate} | Prioridad: {' '}
                        <Badge variant={getPriorityVariant(selectedTask.priority)}>{selectedTask.priority}</Badge>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Detalles de la Tarea */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">Detalles</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTask.details}</p>
                    </div>

                    <Separator />

                    {/* Archivos Adjuntos */}
                    <div>
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            Archivos Adjuntos
                        </h4>
                        <div className="space-y-2">
                            {selectedTask.attachments?.length > 0 ? (
                                selectedTask.attachments.map(file => (
                                    <div key={file.id} className="flex items-center justify-between rounded-md border p-2">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.type)}
                                            <div>
                                                <p className="text-sm font-medium">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{file.size}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4" />
                                            <span className="sr-only">Descargar</span>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay archivos adjuntos.</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Comentarios */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Comentarios
                        </h4>
                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                            {selectedTask.comments?.length > 0 ? (
                                selectedTask.comments.map(comment => (
                                    <div key={comment.id} className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarImage src={comment.avatarUrl} />
                                            <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 rounded-md bg-muted/50 p-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold">{comment.author}</p>
                                                <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                                            </div>
                                            <p className="text-sm mt-1">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay comentarios aún.</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-comment" className="sr-only">Nuevo Comentario</Label>
                            <Textarea 
                                id="new-comment"
                                placeholder="Escribe un comentario..."
                                rows={2}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="outline">
                        <Paperclip className="mr-2 h-4 w-4" />
                        Subir Archivo
                    </Button>
                    <Button onClick={handleAddComment}>Agregar Comentario</Button>
                </DialogFooter>
            </DialogContent>
    )}
    </Dialog>
  );
}

/**
 * Componente principal para la página de detalle de un proyecto.
 */
export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);
  return <ProjectDetailClient initialProject={project} />;
}
