"use client";

import { useState, useTransition, useEffect } from "react";
import { updateComponent, getComponentById } from "@/actions/components";
import { useNotifications } from "@/context/NotificationContext";
import "./ComponentForm.css";

interface EditComponentFormProps {
  componentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditComponentForm({ componentId, onSuccess, onCancel }: EditComponentFormProps) {
  const [data, setData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();

  useEffect(() => {
    async function load() {
      const res = await getComponentById(componentId);
      setData(res);
    }
    load();
  }, [componentId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updateData = Object.fromEntries(formData);
    
    startTransition(async () => {
      const res = await updateComponent(componentId, updateData);
      if (res.success) {
        addNotification("Componente actualizado con éxito", "success");
        onSuccess();
      } else {
        addNotification(`Error al actualizar: ${res.error}`, "error");
      }
    });
  };

  if (!data) return <div className="p-4 text-center">Cargando datos del componente...</div>;

  return (
    <form className="component-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group col-span-2">
          <label>Nombre del componente *</label>
          <input type="text" name="name" required defaultValue={data.name} />
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <input type="text" name="category" required defaultValue={data.category} list="categories" />
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
          <input type="text" name="subcategory" defaultValue={data.subcategory || ""} />
        </div>

        <div className="form-group">
          <label>Referencia / P/N</label>
          <input type="text" name="part_number" defaultValue={data.part_number || ""} />
        </div>

        <div className="form-group">
          <label>Valor</label>
          <input type="text" name="value" defaultValue={data.value || ""} />
        </div>

        <div className="form-group">
          <label>Encapsulado (Package)</label>
          <input type="text" name="package" defaultValue={data.package || ""} />
        </div>

        <div className="form-group">
          <label>Ubicación</label>
          <input type="text" name="location" defaultValue={data.location || ""} />
        </div>

        <div className="form-group">
          <label>Stock Mínimo</label>
          <input type="number" name="min_stock" defaultValue={data.min_stock} min={0} />
        </div>

        <div className="form-group">
          <label>Stock Actual *</label>
          <input type="number" name="current_quantity" defaultValue={data.current_quantity} min={0} required />
        </div>

        <div className="form-group">
          <label>Unidad</label>
          <select name="unit" defaultValue={data.unit || "uds"}>
            <option value="uds">Unidades (uds)</option>
            <option value="m">Metros (m)</option>
            <option value="cm">Centímetros (cm)</option>
            <option value="g">Gramos (g)</option>
          </select>
        </div>
      </div>

      <div className="form-group mt-4">
        <label>URL de Imagen (opcional)</label>
        <input type="url" name="image_url" defaultValue={data.image_url || ""} placeholder="https://..." />
      </div>

      <div className="form-group mt-4">
        <label>Descripción rápida</label>
        <textarea name="description" rows={2} defaultValue={data.description || ""}></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
