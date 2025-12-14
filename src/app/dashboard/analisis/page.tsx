"use client";

import React, { useState, useEffect, useMemo, FormEvent, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { leads as mockLeads, opportunities as mockOpportunities, Lead, Opportunity } from "@/lib/data";
import { AlertTriangle, ShieldCheck, PlusCircle, ChevronsUpDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

// --- Interfaces y Constantes copiadas de Creditos ---

interface ClientOption {
  id: string;
  name: string;
  cedula: string;
  email: string;
}

interface OpportunityOption {
  id: string;
  title: string;
  lead_id: number;
  credit?: { id: number } | null;
}

interface CreditFormValues {
  reference: string;
  title: string;
  status: string;
  category: string;
  monto_credito: string;
  leadId: string;
  opportunityId: string;
  assignedTo: string;
  openedAt: string;
  description: string;
  divisa: string;
  plazo: string;
}

const CREDIT_STATUS_OPTIONS = ["Activo", "Mora", "Cerrado", "Legal"] as const;
const CREDIT_CATEGORY_OPTIONS = ["Regular", "Micro-crédito", "Hipotecario", "Personal"] as const;
const CURRENCY_OPTIONS = [
  { value: "CRC", label: "Colón Costarricense (CRC)" },
  { value: "USD", label: "Dólar Estadounidense (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "Libra Esterlina (GBP)" },
] as const;

// --- Funciones auxiliares de visualización ---

const getPuestoVariant = (puesto: Lead['puesto']) => {
  return puesto === 'En Propiedad' ? 'default' : 'secondary';
};

const getStatusVariant = (status: Opportunity['status'] | 'Sin Iniciar') => {
    switch (status) {
        case 'Convertido': return 'default';
        case 'Aceptada': return 'default';
        case 'En proceso': return 'secondary';
        case 'Rechazada': return 'destructive';
        default: return 'outline';
    }
}

export default function AnalisisPage() {
  const { toast } = useToast();

  // Estados para el formulario de creación de créditos
  const [dialogState, setDialogState] = useState<"create" | null>(null);
  const [formValues, setFormValues] = useState<CreditFormValues>({
    reference: "",
    title: "",
    status: CREDIT_STATUS_OPTIONS[0],
    category: CREDIT_CATEGORY_OPTIONS[0],
    monto_credito: "",
    leadId: "",
    opportunityId: "",
    assignedTo: "",
    openedAt: new Date().toISOString().split('T')[0],
    description: "",
    divisa: "CRC",
    plazo: "36",
  });
  
  // Datos dinámicos para el formulario (Selects)
  const [fetchedLeads, setFetchedLeads] = useState<ClientOption[]>([]);
  const [fetchedOpportunities, setFetchedOpportunities] = useState<OpportunityOption[]>([]);
  const [users, setUsers] = useState<{id: number, name: string}[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Lógica de filtrado para el formulario ---

  const currentLead = useMemo(() => {
    return formValues.leadId ? fetchedLeads.find((lead) => lead.id === formValues.leadId) : null;
  }, [formValues.leadId, fetchedLeads]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return fetchedLeads;
    const lowerQuery = searchQuery.toLowerCase();
    return fetchedLeads.filter(lead =>
      lead.name.toLowerCase().includes(lowerQuery) ||
      (lead.cedula && lead.cedula.includes(lowerQuery))
    );
  }, [fetchedLeads, searchQuery]);

  const availableOpportunities = useMemo(() => {
    return fetchedOpportunities.filter((opportunity) => {
      const belongsToLead = formValues.leadId ? opportunity.lead_id === parseInt(formValues.leadId, 10) : true;
      const isFree = !opportunity.credit;
      return belongsToLead && isFree;
    });
  }, [fetchedOpportunities, formValues.leadId]);

  // --- Fetch de datos para los desplegables del formulario ---

  const fetchFormData = useCallback(async () => {
    try {
        const [leadsRes, oppsRes, usersRes] = await Promise.all([
            api.get('/api/leads'),
            api.get('/api/opportunities'),
            api.get('/api/agents')
        ]);

        const leadsData = leadsRes.data.data || leadsRes.data;
        setFetchedLeads(leadsData.map((l: any) => ({ id: l.id, name: l.name, email: l.email, cedula: l.cedula })));

        const oppsData = oppsRes.data.data || oppsRes.data;
        setFetchedOpportunities(oppsData.map((o: any) => ({
            id: o.id,
            title: `${o.id} - ${o.opportunity_type} - ${new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(o.amount)}`,
            lead_id: o.lead?.id
        })));

        setUsers(usersRes.data);
    } catch (error) {
        console.error("Error fetching form data:", error);
    }
  }, []);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  // --- Handlers ---

  const handleCreate = () => {
    setFormValues({
      reference: "",
      title: "",
      status: CREDIT_STATUS_OPTIONS[0],
      category: CREDIT_CATEGORY_OPTIONS[0],
      monto_credito: "",
      leadId: "",
      opportunityId: "",
      assignedTo: "",
      openedAt: new Date().toISOString().split('T')[0],
      description: "",
      divisa: "CRC",
      plazo: "36",
    });
    setDialogState("create");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const body = {
        reference: formValues.reference,
        title: formValues.title,
        status: formValues.status,
        category: formValues.category,
        monto_credito: parseFloat(formValues.monto_credito) || 0,
        lead_id: parseInt(formValues.leadId),
        opportunity_id: formValues.opportunityId || null,
        assigned_to: formValues.assignedTo,
        opened_at: formValues.openedAt,
        description: formValues.description,
        divisa: formValues.divisa,
        plazo: parseInt(formValues.plazo) || 36,
      };

      await api.post('/api/credits', body);

      toast({ title: "Éxito", description: "Crédito creado correctamente." });
      setDialogState(null);
      // Opcional: Recargar datos si la tabla dependiera de la API
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Análisis de Crédito</CardTitle>
            <CardDescription>
              Analiza el riesgo crediticio de los leads para la toma de decisiones.
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Crédito
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Ocupación</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* $$$ CONECTOR MYSQL: Iteración sobre datos de prueba */}
              {mockLeads.map((lead) => {
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.cedula}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <Badge variant={getPuestoVariant(lead.puesto)}>
                        {lead.puesto === 'En Propiedad' && <ShieldCheck className="mr-1 h-3 w-3"/>}
                        {lead.puesto || '-' }
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.ocupacion || '-'}</TableCell>
                    <TableCell>{lead.institucion_labora || '-'}</TableCell>
                    <TableCell>{lead.responsable || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={lead.is_active === false ? 'secondary' : 'default'}>
                        {typeof lead.lead_status === 'object' ? lead.lead_status.name : (lead.lead_status || lead.status || 'Activo')}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.notes ? lead.notes.slice(0, 32) : '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Diálogo de Creación de Crédito --- */}
      <Dialog open={!!dialogState} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nuevo Crédito</DialogTitle>
            <DialogDescription>Completa la información del crédito.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input
                  id="reference"
                  placeholder="Ej: CRED-ABC12345"
                  value={formValues.reference}
                  onChange={e => setFormValues({ ...formValues, reference: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Crédito Hipotecario..."
                  value={formValues.title}
                  onChange={e => setFormValues({ ...formValues, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={formValues.status} onValueChange={v => setFormValues({ ...formValues, status: v })}>
                  <SelectTrigger id="status"><SelectValue placeholder="Selecciona el estado" /></SelectTrigger>
                  <SelectContent>
                    {CREDIT_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formValues.category} onValueChange={v => setFormValues({ ...formValues, category: v })}>
                  <SelectTrigger id="category"><SelectValue placeholder="Selecciona la categoría" /></SelectTrigger>
                  <SelectContent>
                    {CREDIT_CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="divisa">Divisa</Label>
                <Select value={formValues.divisa} onValueChange={v => setFormValues({ ...formValues, divisa: v })}>
                  <SelectTrigger id="divisa"><SelectValue placeholder="Selecciona la divisa" /></SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">Monto</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formValues.monto_credito}
                  onChange={e => setFormValues({ ...formValues, monto_credito: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plazo">Plazo (Meses)</Label>
                <Select value={formValues.plazo} onValueChange={v => setFormValues({ ...formValues, plazo: v })}>
                  <SelectTrigger id="plazo"><SelectValue placeholder="Selecciona el plazo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="36">36 meses</SelectItem>
                    <SelectItem value="60">60 meses</SelectItem>
                    <SelectItem value="120">120 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="lead">Lead</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="justify-between font-normal w-full"
                    >
                      {formValues.leadId
                        ? fetchedLeads.find((lead) => String(lead.id) === formValues.leadId)?.name
                        : "Selecciona un lead..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[400px]" align="start">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Buscar por nombre o cédula..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredLeads.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">No se encontraron leads.</div>
                      ) : (
                        filteredLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${String(lead.id) === formValues.leadId ? "bg-accent text-accent-foreground" : ""}`}
                            onClick={() => {
                              setFormValues({ ...formValues, leadId: String(lead.id) });
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${String(lead.id) === formValues.leadId ? "opacity-100" : "opacity-0"
                                }`}
                            />
                            <div className="flex flex-col">
                              <span>{lead.name}</span>
                              {lead.cedula && <span className="text-xs text-muted-foreground">{lead.cedula}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunity">Oportunidad (Opcional)</Label>
                <Select value={formValues.opportunityId} onValueChange={v => setFormValues({ ...formValues, opportunityId: v })}>
                  <SelectTrigger id="opportunity"><SelectValue placeholder="Selecciona una oportunidad" /></SelectTrigger>
                  <SelectContent>
                    {availableOpportunities.map(o => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Responsable</Label>
                <Select value={formValues.assignedTo} onValueChange={v => setFormValues({ ...formValues, assignedTo: v })}>
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Selecciona un responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openedAt">Fecha Apertura</Label>
                <Input
                  id="openedAt"
                  type="date"
                  value={formValues.openedAt}
                  onChange={e => setFormValues({ ...formValues, openedAt: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  className="min-h-[120px]"
                  placeholder="Describe el contexto del crédito..."
                  value={formValues.description}
                  onChange={e => setFormValues({ ...formValues, description: e.target.value })}
                />
              </div>
            </div>

            {currentLead ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Información del lead</CardTitle>
                  <CardDescription>Resumen del lead relacionado con este crédito.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <span className="font-medium">Nombre:</span> {currentLead.name}
                    </div>
                    <div>
                      <span className="font-medium">Correo:</span> {currentLead.email ?? "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogState(null)}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}