"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, Edit, Trash2, Eye, Package } from "lucide-react";
import { deleteComponent } from "@/actions/components";
import { useNotifications } from "@/context/NotificationContext";
import Modal from "@/components/Modal";
import ComponentForm from "@/components/ComponentForm";
import ComponentDetailModal from "@/components/ComponentDetailModal";
import EditComponentForm from "@/components/EditComponentForm";
import AddToWishlistButton from "@/components/AddToWishlistButton";

export default function InventoryClient({ initialComponents }: { initialComponents: any[] }) {
  const router = useRouter();
  const [components, setComponents] = useState(initialComponents);
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalId, setEditModalId] = useState<string | null>(null);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  // Extract unique categories for the filter
  const categories = Array.from(new Set(initialComponents.map(c => c.category)));

  const filteredComponents = components.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.value || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.part_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || c.category === filterCategory;
    const matchesLowStock = showLowStockOnly ? c.current_quantity <= c.min_stock : true;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar este componente? Esta acción no se puede deshacer.")) {
      const res = await deleteComponent(id);
      if (res.success) {
        setComponents(components.filter(c => c.id !== id));
        addNotification("Componente eliminado", "info");
      } else {
        addNotification(`Error al eliminar: ${res.error}`, "error");
      }
    }
  };

  const handleActionSuccess = () => {
    setIsCreateModalOpen(false);
    setEditModalId(null);
    router.refresh();
  };

  return (
    <>
      <div className="inventory-content glass panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, valor, referencia..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <Filter size={16} className="text-muted" />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map(cat => (
                  <option key={cat as string} value={cat as string}>{cat as string}</option>
                ))}
              </select>
            </div>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
              />
              Solo stock bajo / agotados
            </label>
          </div>

          <button className="btn-primary flex-row gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            <span>Nuevo Componente</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                 <th>Imagen</th>
                <th>Nombre / Valor</th>
                <th>Categoría</th>
                <th>Ubicación</th>
                <th>Referencia / Pkg</th>
                <th>Stock</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">No se encontraron componentes.</td>
                </tr>
              ) : (
                filteredComponents.map(comp => (
                   <tr key={comp.id}>
                    <td className="w-16">
                      {comp.image_url ? (
                        <div className="component-thumbnail">
                          <img src={comp.image_url} alt={comp.name} />
                        </div>
                      ) : (
                        <div className="component-thumbnail placeholder">
                          <Package size={20} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="font-medium">{comp.name}</div>
                      <div className="text-xs text-muted">{comp.value || "N/A"}</div>
                    </td>
                    <td>
                      <span className="category-tag">{comp.category}</span>
                    </td>
                    <td>{comp.location || "-"}</td>
                    <td>
                      <div className="text-sm">{comp.part_number || "-"}</div>
                      <div className="text-xs text-muted">{comp.package || "-"}</div>
                    </td>
                    <td>
                      <div className="flex-row gap-2">
                         <span className={`qty-indicator ${comp.current_quantity === 0 ? 'danger' : comp.current_quantity <= comp.min_stock ? 'warning' : 'success'}`}>
                           {comp.current_quantity} {comp.unit}
                         </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons text-right">
                        {comp.current_quantity <= comp.min_stock && (
                          <AddToWishlistButton 
                            componentName={comp.name} 
                            category={comp.category} 
                            suggestedQuantity={Math.max(1, comp.min_stock - comp.current_quantity)} 
                          />
                        )}
                        <button className="action-btn" title="Ver detalles" onClick={() => setDetailModalId(comp.id)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn" title="Editar" onClick={() => setEditModalId(comp.id)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn danger" title="Eliminar" onClick={() => handleDelete(comp.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nuevo Componente">
        <ComponentForm onSuccess={handleActionSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editModalId} onClose={() => setEditModalId(null)} title="Editar Componente">
        {editModalId && (
          <EditComponentForm 
            componentId={editModalId} 
            onSuccess={handleActionSuccess} 
            onCancel={() => setEditModalId(null)} 
          />
        )}
      </Modal>

      <ComponentDetailModal 
        isOpen={!!detailModalId} 
        onClose={() => setDetailModalId(null)} 
        componentId={detailModalId} 
      />
    </>
  );
}
