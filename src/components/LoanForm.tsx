"use client";

import { useState, useEffect, useTransition } from "react";
import { getComponentsLight } from "@/actions/components";
import { createLoan } from "@/actions/loans";
import { useNotifications } from "@/context/NotificationContext";

interface LoanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  marginBottom: "1rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--text-muted)",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  border: "1px solid var(--border)",
  color: "var(--text-main)",
  padding: "0.65rem 0.875rem",
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
};

export default function LoanForm({ onSuccess, onCancel }: LoanFormProps) {
  const [components, setComponents] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();
  const [selectedCompId, setSelectedCompId] = useState("");

  useEffect(() => {
    getComponentsLight().then(setComponents);
  }, []);

  const selectedComp = components.find(c => c.id === selectedCompId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompId) return addNotification("Selecciona un componente", "error");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (parseInt(data.quantity as string) > selectedComp.current_quantity) {
      return addNotification(`No hay suficiente stock. Disponible: ${selectedComp.current_quantity}`, "error");
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
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <div style={fieldStyle}>
        <label style={labelStyle}>Componente a Prestar *</label>
        <select
          value={selectedCompId}
          onChange={(e) => setSelectedCompId(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">-- Seleccionar componente --</option>
          {components.map(c => (
            <option key={c.id} value={c.id} disabled={c.current_quantity === 0}>
              {c.name} {c.value ? `(${c.value})` : ""} — {c.current_quantity} disponibles
            </option>
          ))}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Prestar a (Nombre / Grupo) *</label>
        <input type="text" name="person" required placeholder="Ej: Juan Pérez" style={inputStyle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={labelStyle}>Cantidad *</label>
          <input
            type="number"
            name="quantity"
            required
            min="1"
            max={selectedComp ? selectedComp.current_quantity : 99999}
            defaultValue="1"
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={labelStyle}>Fecha Devolución Estimada</label>
          <input type="date" name="expected_return_date" style={inputStyle} />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Notas adicionales</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Condiciones, proyecto destino..."
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-main)", padding: "0.5rem 1.25rem", borderRadius: "8px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          style={{ background: "var(--primary)", border: "none", color: "white", padding: "0.5rem 1.25rem", borderRadius: "8px", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? "Registrando..." : "Confirmar Préstamo"}
        </button>
      </div>
    </form>
  );
}
