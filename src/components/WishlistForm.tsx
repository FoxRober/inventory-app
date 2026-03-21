"use client";

import { useTransition } from "react";
import { createWishlistItem } from "@/actions/wishlist";
import { useNotifications } from "@/context/NotificationContext";
import "./ComponentForm.css"; // We can reuse the same styles

interface WishlistFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WishlistForm({ onSuccess, onCancel }: WishlistFormProps) {
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    startTransition(async () => {
      const res = await createWishlistItem(data);
      if (res.success) {
        addNotification("Componente añadido a la wishlist", "success");
        onSuccess();
      } else {
        addNotification(`Error al guardar: ${res.error}`, "error");
      }
    });
  };

  return (
    <form className="component-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group col-span-2">
          <label>Nombre del componente / Material *</label>
          <input type="text" name="name" required placeholder="Ej: Arduino Uno R3" />
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <input type="text" name="category" required placeholder="Ej: Microcontroladores" list="categories" />
        </div>

        <div className="form-group">
          <label>Cantidad *</label>
          <input type="number" name="quantity" required defaultValue={1} min={1} />
        </div>

        <div className="form-group">
          <label>Prioridad</label>
          <select name="priority" defaultValue="MEDIA">
            <option value="BAJA">Baja (Para después)</option>
            <option value="MEDIA">Media (Útil tenerlo)</option>
            <option value="ALTA">Alta (Necesario pronto)</option>
            <option value="URGENTE">Urgente (Bloqueante)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Precio estimado (COP)</label>
          <input type="number" name="estimated_price" step="0.01" min="0" placeholder="0.00" />
        </div>

        <div className="form-group">
          <label>Tienda (opcional)</label>
          <input type="text" name="store" placeholder="Ej: Amazon, AliExpress, Tienda local" />
        </div>

        <div className="form-group col-span-2">
          <label>Enlace URL (opcional)</label>
          <input type="url" name="url" placeholder="https://..." />
        </div>
      </div>

      <div className="form-group mt-4">
        <label>Motivo o Proyecto (opcional)</label>
        <textarea name="reason" rows={2} placeholder="¿Para qué lo necesitas?"></textarea>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isPending}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Guardando..." : "Añadir a Wishlist"}
        </button>
      </div>
    </form>
  );
}
