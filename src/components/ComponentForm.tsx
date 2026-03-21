"use client";

import { useTransition } from "react";
import { createComponent } from "@/actions/components";
import { useNotifications } from "@/context/NotificationContext";
import "./ComponentForm.css";

interface ComponentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ComponentForm({ onSuccess, onCancel }: ComponentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    startTransition(async () => {
      const res = await createComponent(data);
      if (res.success) {
        addNotification("Componente creado con éxito", "success");
        onSuccess();
      } else {
        addNotification(`Error al crear: ${res.error}`, "error");
      }
    });
  };

  return (
    <form className="component-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group col-span-2">
          <label>Nombre del componente *</label>
          <input type="text" name="name" required placeholder="Ej: Resistencia 10k" />
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <input type="text" name="category" required placeholder="Ej: Resistencias, IC" list="categories" />
          <datalist id="categories">
            <option value="Resistencias" />
            <option value="Capacitores" />
            <option value="Semiconductores" />
            <option value="Circuitos Integrados" />
            <option value="Módulos" />
            <option value="Conectores" />
            <option value="Microcontroladores" />
          </datalist>
        </div>

        <div className="form-group">
          <label>Subcategoría</label>
          <input type="text" name="subcategory" placeholder="Ej: 1/4W, SMD" />
        </div>

        <div className="form-group">
          <label>Referencia / P/N</label>
          <input type="text" name="part_number" placeholder="Ej: NE555P, 2N2222" />
        </div>

        <div className="form-group">
          <label>Valor</label>
          <input type="text" name="value" placeholder="Ej: 10kΩ, 100nF" />
        </div>

        <div className="form-group">
          <label>Encapsulado (Package)</label>
          <input type="text" name="package" placeholder="Ej: DIP-8, 0805, TO-92" />
        </div>

        <div className="form-group">
          <label>Ubicación</label>
          <input type="text" name="location" placeholder="Ej: Caja 1, Gaveta B" />
        </div>

        <div className="form-group">
          <label>Stock Inicial</label>
          <input type="number" name="current_quantity" defaultValue={0} min={0} />
        </div>

        <div className="form-group">
          <label>Stock Mínimo</label>
          <input type="number" name="min_stock" defaultValue={5} min={0} />
        </div>

        <div className="form-group">
          <label>Unidad</label>
          <select name="unit" defaultValue="uds">
            <option value="uds">Unidades (uds)</option>
            <option value="m">Metros (m)</option>
            <option value="cm">Centímetros (cm)</option>
            <option value="g">Gramos (g)</option>
          </select>
        </div>
      </div>

      <div className="form-group mt-4">
        <label>URL de Imagen (opcional)</label>
        <input type="url" name="image_url" placeholder="https://..." />
      </div>

      <div className="form-group mt-4">
        <label>Descripción rápida</label>
        <textarea name="description" rows={2} placeholder="Opcional..."></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar Componente"}
        </button>
      </div>
    </form>
  );
}
