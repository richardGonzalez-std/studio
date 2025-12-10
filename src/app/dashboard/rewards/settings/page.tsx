"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Star,
  Medal,
  Target,
  Gift,
  Users,
  Plus,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for settings
const mockPointsConfig = {
  actions: [
    { id: 1, action: "loan_created", label: "Préstamo creado", points: 100, enabled: true },
    { id: 2, action: "client_added", label: "Cliente agregado", points: 50, enabled: true },
    { id: 3, action: "payment_received", label: "Pago recibido", points: 50, enabled: true },
    { id: 4, action: "document_uploaded", label: "Documento subido", points: 50, enabled: true },
    { id: 5, action: "daily_login", label: "Login diario", points: 10, enabled: true },
    { id: 6, action: "profile_completed", label: "Perfil completado", points: 200, enabled: true },
    { id: 7, action: "referral", label: "Referido exitoso", points: 500, enabled: false },
  ],
  multipliers: {
    streak_3: 1.1,
    streak_7: 1.25,
    streak_14: 1.5,
    streak_30: 2.0,
  },
  limits: {
    daily_points_cap: 1000,
    monthly_points_cap: 20000,
  },
};

const mockLevels = [
  { level: 1, name: "Novato", xp_required: 0, color: "#6B7280" },
  { level: 2, name: "Aprendiz", xp_required: 100, color: "#22C55E" },
  { level: 3, name: "Profesional", xp_required: 500, color: "#3B82F6" },
  { level: 4, name: "Experto", xp_required: 1500, color: "#8B5CF6" },
  { level: 5, name: "Maestro", xp_required: 5000, color: "#F59E0B" },
  { level: 6, name: "Leyenda", xp_required: 15000, color: "#EF4444" },
];

const mockBadges = [
  { id: 1, slug: "first_loan", name: "Primer Préstamo", rarity: "common", enabled: true },
  { id: 2, slug: "streak_master", name: "Maestro de Rachas", rarity: "rare", enabled: true },
  { id: 3, slug: "top_closer", name: "Top Closer", rarity: "legendary", enabled: true },
  { id: 4, slug: "team_player", name: "Jugador de Equipo", rarity: "epic", enabled: false },
];

const mockChallenges = [
  { id: 1, name: "Challenge Semanal", type: "weekly", status: "active", participants: 45 },
  { id: 2, name: "Meta Mensual", type: "monthly", status: "active", participants: 128 },
  { id: 3, name: "Sprint de Ventas", type: "special", status: "scheduled", participants: 0 },
];

const rarityColors = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-amber-500",
};

function PointsConfigTab() {
  const [actions, setActions] = useState(mockPointsConfig.actions);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (id: number) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const handlePointsChange = (id: number, points: number) => {
    setActions(actions.map(a => 
      a.id === id ? { ...a, points } : a
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Configuración de Puntos por Acción
          </CardTitle>
          <CardDescription>
            Define cuántos puntos otorga cada acción en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acción</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="w-32">Puntos</TableHead>
                <TableHead className="w-24 text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">{action.label}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {action.action}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={action.points}
                      onChange={(e) => handlePointsChange(action.id, parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={action.enabled}
                      onCheckedChange={() => handleToggle(action.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Acción
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>

      {/* Multipliers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Multiplicadores de Racha
          </CardTitle>
          <CardDescription>
            Bonificaciones por días consecutivos de actividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg border">
              <Label className="text-sm text-muted-foreground">3 días</Label>
              <Input
                type="number"
                step="0.1"
                defaultValue={mockPointsConfig.multipliers.streak_3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">x multiplicador</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Label className="text-sm text-muted-foreground">7 días</Label>
              <Input
                type="number"
                step="0.1"
                defaultValue={mockPointsConfig.multipliers.streak_7}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">x multiplicador</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Label className="text-sm text-muted-foreground">14 días</Label>
              <Input
                type="number"
                step="0.1"
                defaultValue={mockPointsConfig.multipliers.streak_14}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">x multiplicador</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Label className="text-sm text-muted-foreground">30 días</Label>
              <Input
                type="number"
                step="0.1"
                defaultValue={mockPointsConfig.multipliers.streak_30}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">x multiplicador</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Límites de Puntos
          </CardTitle>
          <CardDescription>
            Controla la cantidad máxima de puntos que se pueden obtener
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Límite diario</Label>
              <Input
                type="number"
                defaultValue={mockPointsConfig.limits.daily_points_cap}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo de puntos por día (0 = sin límite)
              </p>
            </div>
            <div>
              <Label>Límite mensual</Label>
              <Input
                type="number"
                defaultValue={mockPointsConfig.limits.monthly_points_cap}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo de puntos por mes (0 = sin límite)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LevelsConfigTab() {
  const [levels, setLevels] = useState(mockLevels);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Sistema de Niveles
          </CardTitle>
          <CardDescription>
            Configura los niveles y la experiencia requerida para cada uno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Nivel</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>XP Requerida</TableHead>
                <TableHead className="w-32">Color</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.map((level) => (
                <TableRow key={level.level}>
                  <TableCell>
                    <div 
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.level}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input defaultValue={level.name} className="w-40" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" defaultValue={level.xp_required} className="w-32" />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="color" 
                      defaultValue={level.color}
                      className="w-16 h-8 p-1 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Nivel
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function BadgesConfigTab() {
  const [badges, setBadges] = useState(mockBadges);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                Gestión de Badges
              </CardTitle>
              <CardDescription>
                Administra los badges disponibles en el sistema
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Badge
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Badge</DialogTitle>
                  <DialogDescription>
                    Define los detalles del nuevo badge
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input placeholder="Ej: Super Vendedor" className="mt-1" />
                  </div>
                  <div>
                    <Label>Slug (identificador único)</Label>
                    <Input placeholder="Ej: super_seller" className="mt-1" />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea placeholder="Descripción del badge..." className="mt-1" />
                  </div>
                  <div>
                    <Label>Rareza</Label>
                    <Select defaultValue="common">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Común</SelectItem>
                        <SelectItem value="uncommon">Poco común</SelectItem>
                        <SelectItem value="rare">Raro</SelectItem>
                        <SelectItem value="epic">Épico</SelectItem>
                        <SelectItem value="legendary">Legendario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Puntos de recompensa</Label>
                      <Input type="number" defaultValue={100} className="mt-1" />
                    </div>
                    <div>
                      <Label>XP de recompensa</Label>
                      <Input type="number" defaultValue={50} className="mt-1" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Crear Badge
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Badge</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Rareza</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell className="font-medium">{badge.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {badge.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-white", rarityColors[badge.rarity as keyof typeof rarityColors])}>
                      {badge.rarity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {badge.enabled ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ChallengesConfigTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Gestión de Challenges
              </CardTitle>
              <CardDescription>
                Crea y administra los challenges del sistema
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Challenge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Participantes</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockChallenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium">{challenge.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{challenge.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={challenge.status === "active" ? "default" : "secondary"}
                      className={cn(
                        challenge.status === "active" && "bg-green-500"
                      )}
                    >
                      {challenge.status === "active" ? "Activo" : "Programado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{challenge.participants}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Challenge Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Plantillas de Challenges
          </CardTitle>
          <CardDescription>
            Plantillas predefinidas para crear challenges rápidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border hover:border-primary cursor-pointer transition-colors">
              <h4 className="font-medium">Challenge Semanal</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Objetivos que se reinician cada semana
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:border-primary cursor-pointer transition-colors">
              <h4 className="font-medium">Meta Mensual</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Objetivos a largo plazo con mayor recompensa
              </p>
            </div>
            <div className="p-4 rounded-lg border hover:border-primary cursor-pointer transition-colors">
              <h4 className="font-medium">Sprint de Equipo</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Challenges colaborativos entre equipos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CatalogConfigTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Catálogo de Recompensas
              </CardTitle>
              <CardDescription>
                Gestiona los items disponibles para canje
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>El catálogo de recompensas se gestiona desde esta sección.</p>
            <p className="text-sm mt-1">
              Agrega gift cards, merchandise, experiencias y más.
            </p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categorías del Catálogo</CardTitle>
          <CardDescription>
            Organiza los items en categorías
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              Gift Cards <Button variant="ghost" size="icon" className="h-4 w-4 ml-1"><XCircle className="h-3 w-3" /></Button>
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Merchandise <Button variant="ghost" size="icon" className="h-4 w-4 ml-1"><XCircle className="h-3 w-3" /></Button>
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Experiencias <Button variant="ghost" size="icon" className="h-4 w-4 ml-1"><XCircle className="h-3 w-3" /></Button>
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Donaciones <Button variant="ghost" size="icon" className="h-4 w-4 ml-1"><XCircle className="h-3 w-3" /></Button>
            </Badge>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Nueva categoría
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Gamificación
        </h2>
        <p className="text-sm text-muted-foreground">
          Administra todos los aspectos del sistema de recompensas
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="points" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Puntos</span>
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Niveles</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Medal className="h-4 w-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <PointsConfigTab />
        </TabsContent>

        <TabsContent value="levels">
          <LevelsConfigTab />
        </TabsContent>

        <TabsContent value="badges">
          <BadgesConfigTab />
        </TabsContent>

        <TabsContent value="challenges">
          <ChallengesConfigTab />
        </TabsContent>

        <TabsContent value="catalog">
          <CatalogConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
