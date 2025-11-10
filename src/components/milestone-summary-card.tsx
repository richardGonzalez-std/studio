'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Circle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  type Project,
  type Milestone,
} from '@/lib/data';
import { cn } from '@/lib/utils';


export const MilestoneSummaryCard = React.memo(function MilestoneSummaryCard({
  project,
  milestone,
}: {
  project: Project;
  milestone: Milestone;
}) {
  const completedTasks = useMemo(
    () => milestone.tasks.filter((task) => task.completed).length,
    [milestone.tasks]
  );
  const totalTasks = milestone.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isCompleted = progress === 100;

  return (
    <Link href={`/dashboard/tareas/${project.id}/${milestone.id}`} className="block">
        <Card
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
    </Link>
  );
});