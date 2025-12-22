"use client";

import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { type Lead, OPPORTUNITY_STATUSES, VERTICAL_OPTIONS, OPPORTUNITY_TYPES } from "@/lib/data";

interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  leads: Lead[];
  defaultLeadId?: string;
}

interface OpportunityFormValues {
  leadId: string;
  vertical: string;
  opportunityType: string;
  status: string;
  amount: string;
  expectedCloseDate: string;
  comments: string;
}

export function CreateOpportunityDialog({
  open,
  onOpenChange,
  onSuccess,
  leads,
  defaultLeadId,
}: CreateOpportunityDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasDocuments, setHasDocuments] = useState<boolean | null>(null);
  const [checkingDocs, setCheckingDocs] = useState(false);

  // Combobox state
  const [openVertical, setOpenVertical] = useState(false);
  const [searchVertical, setSearchVertical] = useState("");

  // Form state - debe estar antes de los useEffect que lo usan
  const [formValues, setFormValues] = useState<OpportunityFormValues>({
    leadId: defaultLeadId || "",
    vertical: VERTICAL_OPTIONS[0],
    opportunityType: OPPORTUNITY_TYPES[0],
    status: OPPORTUNITY_STATUSES[0],
    amount: "",
    expectedCloseDate: "",
    comments: "",
  });

  // Detectar si es lead o cliente por props
  const isLeadContext = leads && leads.length > 0;

  // Reset form cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setFormValues(prev => ({
        ...prev,
        leadId: defaultLeadId || prev.leadId || (leads.length > 0 ? String(leads[0].id) : ""),
        vertical: VERTICAL_OPTIONS[0],
        opportunityType: OPPORTUNITY_TYPES[0],
        status: OPPORTUNITY_STATUSES[0],
        amount: "",
        expectedCloseDate: "",
        comments: "",
      }));
    }
  }, [open, defaultLeadId, leads]);

  // Verificar documentos al cambiar leadId
  useEffect(() => {
    const checkDocs = async () => {
      setCheckingDocs(true);
      setHasDocuments(null);
      let cedula = "";
      if (isLeadContext) {
        const selectedLead = leads.find(l => String(l.id) === formValues.leadId);
        cedula = selectedLead?.cedula || "";
      }
      if (!cedula) {
        setHasDocuments(false);
        setCheckingDocs(false);
        return;
      }
      try {
        const url = isLeadContext
          ? `/api/leads/check-cedula-folder?cedula=${cedula}`
          : `/api/clients/check-cedula-folder?cedula=${cedula}`;
        const res = await api.get(url);
        setHasDocuments(!!res.data.exists);
      } catch (e) {
        setHasDocuments(false);
      } finally {
        setCheckingDocs(false);
      }
    };
    if (formValues.leadId) checkDocs();
    else setHasDocuments(false);
  }, [formValues.leadId, leads, isLeadContext]);

  const handleFormField = useCallback(
    (field: keyof OpportunityFormValues) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setFormValues((prev) => ({ ...prev, [field]: value }));
      },
    []
  );

  const handleSaveOpportunity = useCallback(async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSaving(true);

      try {
        const selectedLead = leads.find(l => String(l.id) === formValues.leadId);
        if (!selectedLead) {
            toast({ title: "Error", description: "Lead no válido.", variant: "destructive" });
            setIsSaving(false);
            return;
        }

        const body: any = {
            lead_cedula: selectedLead.cedula,
            vertical: formValues.vertical,
            opportunity_type: formValues.opportunityType,
            status: formValues.status,
            amount: parseFloat(formValues.amount) || 0,
            expected_close_date: formValues.expectedCloseDate || null,
            comments: formValues.comments,
            assigned_to_id: selectedLead.assigned_to_id
        };

        await api.post('/api/opportunities', body);
        toast({ title: "Creado", description: "Oportunidad creada correctamente." });

        onOpenChange(false);
        if (onSuccess) onSuccess();
      } catch (error) {
          console.error("Error saving:", error);
          toast({ title: "Error", description: "No se pudo guardar la oportunidad.", variant: "destructive" });
      } finally {
          setIsSaving(false);
      }
  }, [formValues, leads, onOpenChange, onSuccess, toast]);

  const availableLeadOptions = useMemo(() => {
    return leads.map((lead) => ({
      value: String(lead.id),
      label: `${lead.name}${lead.email ? ` · ${lead.email}` : ""}`,
    }));
  }, [leads]);

  const filteredVerticals = useMemo(() => {
    if (!searchVertical) return VERTICAL_OPTIONS;
    return VERTICAL_OPTIONS.filter((v) => v.toLowerCase().includes(searchVertical.toLowerCase()));
  }, [searchVertical]);

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear oportunidad</DialogTitle>
            <DialogDescription>Registra una nueva oportunidad.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveOpportunity}>
            <div className="space-y-2">
              <Label>Lead asociado</Label>
              <Select 
                value={formValues.leadId} 
                onValueChange={(val) => setFormValues(prev => ({ ...prev, leadId: val }))} 
                disabled={!!defaultLeadId}
              >
                <SelectTrigger><SelectValue placeholder="Selecciona un lead" /></SelectTrigger>
                <SelectContent>
                    {availableLeadOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label>Vertical</Label>
                <Popover open={openVertical} onOpenChange={setOpenVertical} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openVertical}
                      className="w-full justify-between"
                    >
                      {formValues.vertical
                        ? VERTICAL_OPTIONS.find((v) => v === formValues.vertical)
                        : "Seleccionar vertical..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 z-[200]">
                    <div className="p-2 border-b">
                        <Input 
                            placeholder="Buscar vertical..." 
                            value={searchVertical} 
                            onChange={(e) => setSearchVertical(e.target.value)}
                            className="h-8"
                        />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {filteredVerticals.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">No se encontraron resultados.</div>
                        ) : (
                            filteredVerticals.map((vertical) => (
                                <div
                                    key={vertical}
                                    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${formValues.vertical === vertical ? "bg-accent text-accent-foreground" : ""}`}
                                    onClick={() => {
                                        setFormValues(prev => ({ ...prev, vertical: vertical }));
                                        setOpenVertical(false);
                                        setSearchVertical("");
                                    }}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${
                                            formValues.vertical === vertical ? "opacity-100" : "opacity-0"
                                        }`}
                                    />
                                    {vertical}
                                </div>
                            ))
                        )}
                    </div>
                  </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formValues.opportunityType} onValueChange={(val) => setFormValues(prev => ({ ...prev, opportunityType: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {OPPORTUNITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={formValues.status} onValueChange={(val) => setFormValues(prev => ({ ...prev, status: val }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {OPPORTUNITY_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Monto</Label>
                    <Input type="number" value={formValues.amount} onChange={handleFormField("amount")} placeholder="0.00" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Cierre esperado</Label>
                    <Input type="date" value={formValues.expectedCloseDate} onChange={handleFormField("expectedCloseDate")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Comentarios</Label>
                    <Textarea value={formValues.comments} onChange={handleFormField("comments")} rows={3} />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving || checkingDocs || !hasDocuments}>
                  {isSaving
                    ? "Guardando..."
                    : checkingDocs
                      ? "Verificando documentos..."
                      : hasDocuments
                        ? "Guardar"
                        : "Sube documentos para habilitar"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}
