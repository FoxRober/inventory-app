"use client";

import { useTransition } from "react";
import { updateWishlistItem } from "@/actions/wishlist";
import { useNotifications } from "@/context/NotificationContext";
import "./ComponentForm.css"; // Reuse styling pattern

interface EditWishlistFormProps {
  item: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditWishlistForm({ item, onSuccess, onCancel }: EditWishlistFormProps) {
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    startTransition(async () => {
      const res = await updateWishlistItem(item.id, data);
      if (res.success) {
        addNotification("Ítem actualizado con éxito", "success");
        onSuccess();
      } else {
        addNotification(`Error al actualizar: ${res.error}`, "error");
      }
    });
  };

  return (
    <form className="component-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group col-span-2">
          <label>Nombre / Componente *</label>
          <input type="text" name="name" required defaultValue={item.name} />
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <input type="text" name="category" required defaultValue={item.category} list="categories" />
        </div>

        <div className="form-group">
          <label>Cantidad a comprar</label>
          <input type="number" name="quantity" min="1" defaultValue={item.quantity} required />
        </div>

        <div className="form-group">
          <label>Prioridad</label>
          <select name="priority" defaultValue={item.priority}>
            <option value="BAJA">Baja - Para tener de stock</option>
            <option value="MEDIA">Media - Próximo proyecto</option>
            <option value="ALTA">Alta - Urgente / Bloqueante</option>
          </select>
        </div>

        <div className="form-group">
          <label>Costo Estimado Unitario (COP)</label>
          <input type="number" name="estimated_price" step="0.01" defaultValue={item.estimated_price || ""} placeholder="Ej: 5000" />
        </div>

        <div className="form-group">
          <label>Tienda Sugerida</label>
          <input type="text" name="store" defaultValue={item.store || ""} placeholder="Ej: Electrónica Center" />
        </div>
      </div>

      <div className="form-group mt-4">
        <label>URL / Enlace de Compra</label>
        <input type="url" name="url" defaultValue={item.url || ""} placeholder="https://..." />
      </div>

      <div className="form-group mt-4">
        <label>Razón o Notas (Opcional)</label>
        <textarea name="reason" rows={2} defaultValue={item.reason || ""} placeholder="Para armar el carrito de robot..."></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Actualizando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
