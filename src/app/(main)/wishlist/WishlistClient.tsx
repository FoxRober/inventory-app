"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink, CheckCircle, Trash2 } from "lucide-react";
import { updateWishlistItemStatus } from "@/actions/wishlist";
import { useNotifications } from "@/context/NotificationContext";
import Modal from "@/components/Modal";
import WishlistForm from "@/components/WishlistForm";
import "./wishlist.css";

// Un simple helper nativo para el formato de moneda.
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
};

export default function WishlistClient({ initialItems }: { initialItems: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { addNotification } = useNotifications();

  const handleUpdateStatus = (id: string, newStatus: "COMPRADO" | "DESCARTADO") => {
    startTransition(async () => {
      const res = await updateWishlistItemStatus(id, newStatus);
      if (res.success) {
        setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
        addNotification(`Ítem marcado como ${newStatus.toLowerCase()}`, "info");
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    });
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  const pendingItems = items.filter(i => i.status === "PENDIENTE");
  const completedItems = items.filter(i => i.status !== "PENDIENTE");

  const renderCard = (item: any) => {
    const isItemPending = item.status === "PENDIENTE";
    return (
      <div key={item.id} className={`wishlist-card glass ${item.priority.toLowerCase()} ${!isItemPending ? "completed" : ""}`}>
        <div className="card-header">
          <div className="title-group">
            <h3>{item.name}</h3>
            <span className="category-pill">{item.category}</span>
          </div>
          {isItemPending && (
            <span className={`priority-badge ${item.priority.toLowerCase()}`}>
              {item.priority}
            </span>
          )}
        </div>
        
        <div className="card-body">
          <div className="info-row">
            <span>Cantidad requerida:</span>
            <strong>{item.quantity}</strong>
          </div>
          {item.estimated_price && (
            <div className="info-row">
              <span>Costo estimado ud.:</span>
              <strong>{formatCurrency(item.estimated_price)}</strong>
            </div>
          )}
          {item.reason && (
            <p className="reason-text">"{item.reason}"</p>
          )}
          
          {item.store && (
            <div className="store-info">
              <span>Tienda: {item.store}</span>
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="store-link">
                  Ver Enlace <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="card-footer">
          {isItemPending ? (
            <div className="action-buttons full-width">
              <button 
                className="btn-success flex-1" 
                onClick={() => handleUpdateStatus(item.id, "COMPRADO")}
                disabled={isPending}
              >
                <CheckCircle size={16} /> Comprado
              </button>
              <button 
                className="action-btn danger" 
                title="Descartar"
                onClick={() => handleUpdateStatus(item.id, "DESCARTADO")}
                disabled={isPending}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="status-label">
              Estado: <strong className={item.status === "COMPRADO" ? "text-success" : "text-muted"}>{item.status}</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="wishlist-content">
        <div className="toolbar panel glass mb-4">
          <button className="btn-primary flex-row gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            <span>Añadir a Wishlist</span>
          </button>
          <div className="summary">
            <span>Total Previsto: </span>
            <strong>{formatCurrency(pendingItems.reduce((acc, item) => acc + ((item.estimated_price || 0) * item.quantity), 0))}</strong>
          </div>
        </div>

        <div className="wishlist-sections">
          <section className="pending-section">
            <h2>Pendientes ({pendingItems.length})</h2>
            {pendingItems.length === 0 ? (
              <p className="empty-state">No hay componentes en la lista de deseos. ¡Todo al día!</p>
            ) : (
              <div className="cards-grid">
                {pendingItems.map(renderCard)}
              </div>
            )}
          </section>

          {completedItems.length > 0 && (
            <section className="completed-section">
              <h2>Historial (Comprados / Descartados)</h2>
              <div className="cards-grid opacity-75">
                {completedItems.map(renderCard)}
              </div>
            </section>
          )}
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Añadir a Wishlist">
        <WishlistForm onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </>
  );
}
