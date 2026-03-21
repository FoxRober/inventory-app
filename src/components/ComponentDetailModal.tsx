"use client";

import { useState, useEffect, useTransition } from "react";
import { getComponentById } from "@/actions/components";
import { createLoan } from "@/actions/loans";
import { createMovement } from "@/actions/components";
import { getProjects, linkComponentToProject, unlinkComponentFromProject } from "@/actions/projects";
import { useNotifications } from "@/context/NotificationContext";
import Modal from "./Modal";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, Info, History, Clock, FolderOpen } from "lucide-react";
import "./ComponentDetailModal.css";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentId: string | null;
}

export default function ComponentDetailModal({ isOpen, onClose, componentId }: DetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // info, movements, loans, projects
  const [isPending, startTransition] = useTransition();
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const { addNotification } = useNotifications();

  const loadData = async () => {
    if (!componentId) return;
    setLoading(true);
    const [result, projectsList] = await Promise.all([
      getComponentById(componentId),
      getProjects()
    ]);
    setData(result);
    setAllProjects(projectsList);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && componentId) {
      loadData();
      setActiveTab("info");
    }
  }, [isOpen, componentId]);

  const handleQuickAction = (type: "COMPRA" | "USO" | "PRESTAMO") => {
    const qtyStr = window.prompt(`¿Qué cantidad deseas registrar para ${type}?`);
    if (!qtyStr) return;
    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty <= 0) return addNotification("Cantidad inválida", "error");

    if (type === "PRESTAMO") {
      const person = window.prompt("¿A quién se le presta?");
      if (!person) return;
      
      startTransition(async () => {
        const res = await createLoan({
          component_id: componentId,
          quantity: qty,
          person: person,
          notes: "Préstamo rápido",
        });
        if (res.success) {
          addNotification(`Préstamo de ${qty} unidades registrado`, "success");
          loadData();
        } else addNotification("Error: " + res.error, "error");
      });
    } else {
       // Uso o Compra
       startTransition(async () => {
        const res = await createMovement(componentId!, type, qty, `Registro rápido de ${type.toLowerCase()}`);
        if (res.success) {
          addNotification(`${type === "COMPRA" ? "Entrada" : "Salida"} de ${qty} unidades registrada`, "success");
          
          // Check for low stock alert
          if (type === "USO" && data) {
            const newQty = data.current_quantity - qty;
            if (newQty <= data.min_stock) {
              addNotification(`¡Atención! Stock bajo para ${data.name} (${newQty} restantes)`, "warning");
            }
          }
          
          loadData();
        } else addNotification("Error: " + res.error, "error");
      });
    }
  };

  const handleLinkProject = (projectId: string, quantity: number = 1) => {
    if (!componentId) return;
    startTransition(async () => {
      const res = await linkComponentToProject(projectId, componentId, quantity);
      if (res.success) {
        addNotification("Componente asociado al proyecto", "success");
        loadData();
      } else addNotification(`Error: ${res.error}`, "error");
    });
  };

  const handleUnlinkProject = (projectId: string) => {
    if (!componentId) return;
    startTransition(async () => {
      const res = await unlinkComponentFromProject(projectId, componentId);
      if (res.success) {
        addNotification("Proyect desvinculado", "info");
        loadData();
      } else addNotification(`Error: ${res.error}`, "error");
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={data ? data.name : "Detalles"}>
      {loading || !data ? (
        <div className="loading-state">Cargando información...</div>
      ) : (
        <div className="detail-modal-wrapper">
          <div className="quick-actions glass">
            <button className="btn-success" onClick={() => handleQuickAction("COMPRA")} disabled={isPending}>
              + Añadir Compra
            </button>
            <button className="btn-danger" onClick={() => handleQuickAction("USO")} disabled={isPending}>
              - Descontar Uso
            </button>
            <button className="btn-warning" onClick={() => handleQuickAction("PRESTAMO")} disabled={isPending}>
              Prestar
            </button>
          </div>

          <div className="tabs">
            <button className={`tab ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
              <Info size={16} /> Información
            </button>
            <button className={`tab ${activeTab === "movements" ? "active" : ""}`} onClick={() => setActiveTab("movements")}>
              <History size={16} /> Movimientos
            </button>
            <button className={`tab ${activeTab === "loans" ? "active" : ""}`} onClick={() => setActiveTab("loans")}>
              <Clock size={16} /> Préstamos
            </button>
            <button className={`tab ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>
              <FolderOpen size={16} /> Proyectos
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "info" && (
              <div className="info-tab-wrapper">
                {data.image_url && (
                  <div className="detail-image-wrapper">
                    <img 
                      src={data.image_url} 
                      alt={data.name} 
                      onError={(e) => { 
                        e.currentTarget.style.display = 'none'; 
                        addNotification("La URL de la imagen es inválida o no se puede cargar", "warning");
                      }} 
                    />
                  </div>
                )}
                <div className="info-grid">
                <div className="info-item">
                  <span className="label">Categoría</span>
                  <span className="value">{data.category}</span>
                </div>
                <div className="info-item">
                  <span className="label">Subcategoría</span>
                  <span className="value">{data.subcategory || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Valor Nominal</span>
                  <span className="value">{data.value || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Referencia P/N</span>
                  <span className="value">{data.part_number || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Encapsulado</span>
                  <span className="value">{data.package || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Ubicación Física</span>
                  <span className="value">{data.location || "-"}</span>
                </div>
                <div className="info-item highlight">
                  <span className="label">Stock Actual</span>
                  <span className={`value qty ${data.current_quantity <= data.min_stock ? "text-danger" : "text-success"}`}>
                    {data.current_quantity} {data.unit}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Stock Mínimo Ideal</span>
                  <span className="value">{data.min_stock} {data.unit}</span>
                </div>
                {data.description && (
                  <div className="info-item full-width">
                    <span className="label">Descripción</span>
                    <span className="value">{data.description}</span>
                  </div>
                )}
              </div>
            </div>
            )}

            {activeTab === "movements" && (
              <div className="history-list">
                {data.movements.length === 0 ? <p className="empty-msg">No hay historial</p> : null}
                {data.movements.map((mov: any) => {
                  const isEntry = mov.type === "COMPRA" || mov.type === "DEVOLUCION" || (mov.type === "AJUSTE_MANUAL" && mov.quantity > 0);
                  return (
                    <div key={mov.id} className="history-item glass">
                      <div className={`icon ${isEntry ? "entry" : "exit"}`}>
                        {isEntry ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="details">
                        <strong>{mov.type}</strong>
                        {mov.notes && <span>{mov.notes}</span>}
                      </div>
                      <div className="meta">
                        <span className={`qty ${isEntry ? "text-success" : "text-main"}`}>
                          {isEntry ? "+" : "-"}{Math.abs(mov.quantity)}
                        </span>
                        <span className="date">{formatDistanceToNow(new Date(mov.date), { addSuffix: true, locale: es })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "loans" && (
              <div className="history-list">
                {data.loans.length === 0 ? <p className="empty-msg">No hay préstamos registrados</p> : null}
                {data.loans.map((loan: any) => (
                  <div key={loan.id} className="history-item glass" style={{ borderLeft: `3px solid ${loan.status === 'PRESTADO' ? 'var(--warning)' : 'var(--border)'}`}}>
                    <div className="details">
                      <strong>Préstamo a {loan.person}</strong>
                      <span>{loan.quantity} {data.unit} • Estado: {loan.status}</span>
                    </div>
                    <div className="meta">
                      <span className="date">{new Date(loan.loan_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "projects" && (
              <div className="history-list">
                <div className="flex-col gap-2 mb-4 bg-background/50 border border-white/10 p-3 rounded-md">
                  <label className="text-sm font-medium">Asignar a un proyecto</label>
                  <div className="flex-row gap-2">
                    <select 
                      className="flex-1 text-sm bg-background border border-white/10 rounded px-2"
                      id="project-select"
                      disabled={isPending}
                    >
                      <option value="">Seleccione un proyecto...</option>
                      {allProjects.filter((p: any) => !data.projects?.find((dp: any) => dp.project.id === p.id)).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      id="project-qty" 
                      min="1" 
                      defaultValue="1" 
                      className="w-16 p-1 text-sm bg-background border border-white/10 rounded text-center" 
                    />
                    <button 
                      className="btn-success px-3 py-1 h-fit text-xs font-medium" 
                      onClick={() => {
                         const selectEl = document.getElementById("project-select") as HTMLSelectElement;
                         const qtyEl = document.getElementById("project-qty") as HTMLInputElement;
                         if (!selectEl.value) return;
                         handleLinkProject(selectEl.value, parseInt(qtyEl.value) || 1);
                         selectEl.value = "";
                      }}
                      disabled={isPending}
                    > Asignar </button>
                  </div>
                </div>
                {(!data.projects || data.projects.length === 0) ? <p className="empty-msg">No pertenece a ningún proyecto.</p> : null}
                {data.projects?.map((proj: any) => (
                  <div key={proj.id} className="history-item glass flex gap-3 items-center p-3" style={{ borderLeft: `3px solid var(--primary)` }}>
                    <div className="bg-primary/20 text-primary font-bold rounded-md px-2 py-1 text-sm min-w-[2.5rem] text-center">
                      {proj.quantity}x
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="block truncate">{proj.project.name}</strong>
                    </div>
                    <button 
                      className="btn-danger p-1.5 rounded-md h-fit shrink-0 transition-transform hover:scale-105" 
                      onClick={() => handleUnlinkProject(proj.project.id)}
                      disabled={isPending}
                      title="Remover"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
