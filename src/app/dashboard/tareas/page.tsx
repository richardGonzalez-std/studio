// Importamos componentes e íconos necesarios para construir la página.
import { MoreHorizontal, PlusCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Importamos los datos de las tareas desde nuestro archivo de datos de ejemplo.
import { tasks, staff, Task } from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Función para obtener el color de la insignia de prioridad.
const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
        case 'Alta': return 'destructive';
        case 'Media': return 'default';
        case 'Baja': return 'secondary';
        default: return 'outline';
    }
}

// Función para obtener el color de la insignia de estado.
const getStatusVariant = (status: Task['status']) => {
    switch (status) {
        case 'Completada': return 'secondary';
        case 'En Progreso': return 'default';
        case 'Pendiente': return 'outline';
        default: return 'outline';
    }
}

// Esta es la función principal que define la página de Tareas.
export default function TareasPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Tareas</CardTitle>
            <CardDescription>Organiza y asigna las tareas pendientes de los casos.</CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Agregar Tarea
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TasksTable tasks={tasks} />
      </CardContent>
    </Card>
  );
}

// Componente reutilizable para mostrar la tabla de tareas.
function TasksTable({ tasks }: { tasks: Task[] }) {
    // Helper para encontrar el avatar del asignado
    const getAvatarUrl = (name: string) => {
        const user = staff.find(s => s.name === name);
        return user ? user.avatarUrl : undefined;
    };
    
    return (
        <div className="relative w-full overflow-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Caso Asignado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead>Asignada a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                        <Link href={`/dashboard/cases/${task.caseId.toLowerCase()}`} className="hover:underline">
                            {task.caseId}
                        </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {task.priority === 'Alta' && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                             <Avatar className="h-7 w-7">
                                <AvatarImage src={getAvatarUrl(task.assignedTo)} />
                                <AvatarFallback>{task.assignedTo.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{task.assignedTo}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                        <DropdownMenuItem>Actualizar Estado</DropdownMenuItem>
                        <DropdownMenuItem>Reasignar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    );
}
