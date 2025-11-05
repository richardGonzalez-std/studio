// Importamos componentes e íconos necesarios para construir la página.
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
// Importamos los datos de los cobros desde nuestro archivo de datos de ejemplo.
import { cobros, Cobro } from "@/lib/data";

// Esta función determina el color de la insignia (Badge) según el estado del cobro.
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Con Sentencia': return 'secondary';
        case 'Con Depósito': return 'default';
        case 'Retirado': return 'destructive';
        default: return 'secondary';
    }
}

// Esta es la función principal que define la página de Cobros.
export default function CobrosPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Cobros</CardTitle>
            <CardDescription>Administra los cobros de las ejecuciones de sentencias.</CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Agregar Cobro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CobrosTable cobros={cobros} />
      </CardContent>
    </Card>
  );
}

// Este es un componente reutilizable para mostrar la tabla de cobros.
function CobrosTable({ cobros }: { cobros: Cobro[] }) {
    return (
        <div className="relative w-full overflow-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Número de Ejecución</TableHead>
                <TableHead>Número de Amparo</TableHead>
                <TableHead>Fecha de Sentencia</TableHead>
                <TableHead>Fecha de Presentación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* Mapeamos cada cobro a una fila de la tabla. */}
                {cobros.map((cobro) => (
                <TableRow key={cobro.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{cobro.ejecucionId}</TableCell>
                    <TableCell>{cobro.amparoId}</TableCell>
                    <TableCell>{cobro.fechaSentencia}</TableCell>
                    <TableCell>{cobro.fechaPresentacion}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(cobro.status)}>{cobro.status}</Badge>
                    </TableCell>
                    <TableCell>
                    {/* Menú de acciones para cada cobro. */}
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
