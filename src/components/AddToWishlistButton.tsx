"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createWishlistItem } from "@/actions/wishlist";
import { useNotifications } from "@/context/NotificationContext";

interface AddToWishlistButtonProps {
  componentName: string;
  category: string;
  suggestedQuantity: number;
}

export default function AddToWishlistButton({ componentName, category, suggestedQuantity }: AddToWishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();

  const handleAdd = () => {
    startTransition(async () => {
      const res = await createWishlistItem({
        name: componentName,
        category: category,
        quantity: suggestedQuantity > 0 ? suggestedQuantity : 1,
        priority: "ALTA",
        reason: "Stock crítico automático",
      });

      if (res.success) {
        addNotification(`Agregado a wishlist: ${componentName}`, "success");
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    });
  };

  return (
    <button 
      onClick={handleAdd} 
      disabled={isPending}
      className="action-btn"
      title="Añadir faltante a wishlist"
      style={{ opacity: isPending ? 0.5 : 1 }}
    >
      <Plus size={16} />
    </button>
  );
}
