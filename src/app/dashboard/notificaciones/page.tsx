// Importamos componentes e íconos necesarios.
import { MoreHorizontal, AlertTriangle } from "lucide-react";
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
// Importamos los datos de ejemplo.
import { judicialNotifications, JudicialNotification } from "@/lib/data";
import { cn } from "@/lib/utils";

// Función para obtener la variante de la insignia según el estado.
const getStatusVariant = (status: 'Leída' | 'Pendiente') => {
    switch (status) {
        case 'Leída': return 'secondary';
        case 'Pendiente': return 'default';
        default: return 'secondary';
    }
};

// Función para obtener la variante del acto judicial.
const getActoVariant = (acto: JudicialNotification['acto']) => {
    switch (acto) {
        case 'Prevención': return 'destructive';
        case 'Con Lugar con Costas': return 'default';
        case 'Con Lugar sin Costas': return 'secondary';
        default: return 'outline';
    }
};

// Página principal de Notificaciones Judiciales.
export default function NotificacionesPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notificaciones Judiciales</CardTitle>
            <CardDescription>
              Gestiona las notificaciones judiciales recibidas automáticamente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <NotificationsTable notifications={judicialNotifications} />
      </CardContent>
    </Card>
  );
}

// Componente para la tabla de notificaciones.
function NotificationsTable({ notifications }: { notifications: JudicialNotification[] }) {
    return (
        <div className="relative w-full overflow-auto">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Expediente</TableHead>
                    <TableHead>Acto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Asignada a</TableHead>
                    <TableHead>
                        <span className="sr-only">Acciones</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* Mapeamos cada notificación a una fila de la tabla. */}
                {notifications.map((notification) => (
                <TableRow 
                    key={notification.id} 
                    className={cn(
                        "hover:bg-muted/50",
                        notification.acto === 'Prevención' && "bg-destructive/10 hover:bg-destructive/20"
                    )}
                >
                    <TableCell className="font-medium">{notification.expediente}</TableCell>
                    <TableCell>
                      <Badge variant={getActoVariant(notification.acto)}>
                        {notification.acto === 'Prevención' && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {notification.acto}
                      </Badge>
                    </TableCell>
                    <TableCell>{notification.fecha}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(notification.status)}>{notification.status}</Badge>
                    </TableCell>
                    <TableCell>{notification.asignadaA}</TableCell>
                    <TableCell>
                    {/* Menú de acciones para cada notificación. */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Documento Adjunto</DropdownMenuItem>
                        <DropdownMenuItem>Marcar como Leída</DropdownMenuItem>
                        <DropdownMenuItem>Asignar a...</DropdownMenuItem>
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