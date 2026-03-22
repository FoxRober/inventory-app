"use client";

import { useState, useEffect, useTransition } from "react";
import { getComponents } from "@/actions/components";
import { createLoan } from "@/actions/loans";
import { useNotifications } from "@/context/NotificationContext";
import "./ComponentForm.css"; // We borrow the same sleek grid

interface LoanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LoanForm({ onSuccess, onCancel }: LoanFormProps) {
  const [components, setComponents] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();
  const [selectedCompId, setSelectedCompId] = useState("");

  useEffect(() => {
    getComponents().then(setComponents);
  }, []);

  const selectedComp = components.find(c => c.id === selectedCompId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompId) return addNotification("Selecciona un componente", "error");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Prevent loaning more than available
    if (parseInt(data.quantity as string) > selectedComp.current_quantity) {
      return addNotification(`No tienes suficiente stock. Disponible: ${selectedComp.current_quantity}`, "error");
    }

    startTransition(async () => {
      const res = await createLoan({
        component_id: selectedCompId,
        person: data.person,
        quantity: data.quantity,
        expected_return_date: data.expected_return_date,
        notes: data.notes
      });

      if (res.success) {
        addNotification("Préstamo registrado exitosamente", "success");
        onSuccess();
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    });
  };

  return (
    <form className="component-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group col-span-2">
          <label>Componente a Prestar *</label>
          <select 
            value={selectedCompId} 
            onChange={(e) => setSelectedCompId(e.target.value)} 
            required
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-main focus:outline-none focus:border-primary"
            style={{ fontFamily: 'inherit' }}
          >
            <option value="">-- Seleccionar componente --</option>
            {components.map(c => (
              <option key={c.id} value={c.id} disabled={c.current_quantity === 0}>
                {c.name} {c.value ? `(${c.value})` : ""} - {c.current_quantity} disponibles
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Prestar a (Nombre/Grupo) *</label>
          <input type="text" name="person" required placeholder="Ej: Juan Pérez" />
        </div>

        <div className="form-group">
          <label>Cantidad a prestar *</label>
          <input 
            type="number" 
            name="quantity" 
            required 
            min="1" 
            max={selectedComp ? selectedComp.current_quantity : 99999} 
            defaultValue="1" 
          />
        </div>

        <div className="form-group col-span-2">
          <label>Fecha Estimada de Devolución (Opcional)</label>
          <input type="date" name="expected_return_date" />
        </div>

        <div className="form-group col-span-2">
          <label>Notas adicionales</label>
          <textarea name="notes" rows={2} placeholder="Condiciones, proyecto destino..."></textarea>
        </div>
      </div>

      <div className="form-actions mt-4">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Registrando..." : "Confirmar Préstamo"}
        </button>
      </div>
    </form>
  );
}
