"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FolderOpen, Eye, Search } from "lucide-react";
import { createProject, deleteProject, linkComponentToProject, unlinkComponentFromProject } from "@/actions/projects";
import { useNotifications } from "@/context/NotificationContext";
import Modal from "@/components/Modal";
import "./projects.css";

export default function ProjectsClient({ initialProjects, allComponents }: { initialProjects: any[], allComponents?: any[] }) {
  const router = useRouter();
  const projects = initialProjects;
  const componentsList = allComponents || [];
  const [isPending, startTransition] = useTransition();
  const { addNotification } = useNotifications();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [addQuantity, setAddQuantity] = useState<{ [id: string]: number }>({});

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createProject(newProject);
      if (res.success) {
        addNotification(`Proyecto creado: ${newProject.name}`, "success");
        setIsCreateModalOpen(false);
        setNewProject({ name: "", description: "" });
        router.refresh();
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el proyecto "${name}"? Los componentes asociados no se verán afectados.`)) {
      startTransition(async () => {
        const res = await deleteProject(id);
        if (res.success) {
          addNotification("Proyecto eliminado", "info");
          if (selectedProjectId === id) setSelectedProjectId(null);
          router.refresh();
        } else {
          addNotification(`Error: ${res.error}`, "error");
        }
      });
    }
  };

  const handleLinkComponent = (projectId: string, componentId: string, quantity: number) => {
    startTransition(async () => {
      const res = await linkComponentToProject(projectId, componentId, quantity);
      if (res.success) {
        addNotification(`Agregado al proyecto (${quantity} unidades)`, "success");
        router.refresh();
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    });
  };

  const handleUnlinkComponent = (projectId: string, componentId: string) => {
    startTransition(async () => {
      const res = await unlinkComponentFromProject(projectId, componentId);
      if (res.success) {
        addNotification("Componente removido del proyecto", "info");
        router.refresh();
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    });
  };

  const filteredComponents = componentsList.filter((c: any) => {
    if (!selectedProject) return false;
    const isAlreadyLinked = selectedProject.components?.some((sc: any) => sc.id === c.id);
    if (isAlreadyLinked) return false;
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || 
           c.category.toLowerCase().includes(term) || 
           (c.part_number && c.part_number.toLowerCase().includes(term));
  });

  return (
    <>
      <div className="toolbar panel glass mb-4">
        <button className="btn-primary flex-row gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <p className="empty-state w-full text-center">No hay proyectos creados.</p>
        ) : (
          projects.map(proj => (
            <div key={proj.id} className="project-card glass">
              <div className="project-header">
                <div className="project-title">
                  <FolderOpen size={20} className="text-primary" />
                  <h3>{proj.name}</h3>
                </div>
                <div className="action-buttons">
                  <button className="action-btn" title="Administrar Componentes" onClick={() => { setSelectedProjectId(proj.id); setSearchTerm(""); }}>
                    <Eye size={16} />
                  </button>
                  <button className="action-btn danger" onClick={() => handleDelete(proj.id, proj.name)} disabled={isPending}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="project-body">
                {proj.description && <p className="project-desc">{proj.description}</p>}
                <div className="project-stats mt-4">
                  <span className="badge-neutral">{proj.components?.length || proj._count?.components || 0} Componentes</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nuevo Proyecto">
        <form onSubmit={handleCreate} className="form-layout">
          <div className="form-group">
            <label>Nombre del proyecto *</label>
            <input 
              type="text" 
              required 
              value={newProject.name} 
              onChange={e => setNewProject({...newProject, name: e.target.value})}
              placeholder="Ej: Seguidor de línea"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea 
              value={newProject.description} 
              onChange={e => setNewProject({...newProject, description: e.target.value})}
              placeholder="Opcional..."
              rows={3}
            />
          </div>
          <div className="form-actions mt-6">
            <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? "Guardando..." : "Crear Proyecto"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProjectId(null)} title={`Gestionar: ${selectedProject?.name}`}>
        {selectedProject && (
          <div className="form-layout">
            {selectedProject.description && <p className="text-muted text-sm mb-4">{selectedProject.description}</p>}
            
            <div className="form-group">
              <label>Añadir componente a este proyecto</label>
              <div className="flex-row gap-2 mt-2 mb-2 items-center bg-background/50 border border-white/10 rounded-md px-3 py-2">
                <Search size={16} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Buscar componente por nombre o categoría..." 
                  className="w-full bg-transparent border-none outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm.trim().length > 0 && (
                <div className="search-results max-h-48 overflow-y-auto glass p-2 rounded-md mb-4 border border-white/5">
                  {filteredComponents.length === 0 ? (
                    <p className="text-xs text-muted text-center py-3">No se encontraron componentes disponibles.</p>
                  ) : (
                    filteredComponents.slice(0, 10).map((c: any) => (
                      <div key={c.id} className="flex-row items-center justify-between p-2 border-b border-white/5 last:border-b-0 hover:bg-white/5 rounded transition-colors">
                        <div className="flex-1 min-w-0 pr-2">
                          <strong className="text-sm block truncate" title={c.name}>{c.name}</strong>
                          <span className="text-xs text-muted block truncate">{c.category} • Disp: {c.current_quantity}</span>
                        </div>
                        <div className="flex-row items-center gap-2 shrink-0">
                          <input 
                            type="number" 
                            min="1" 
                            max={c.current_quantity > 0 ? c.current_quantity : undefined}
                            className="w-14 p-1 text-sm bg-background border border-white/10 rounded text-center" 
                            value={addQuantity[c.id] || 1}
                            onChange={(e) => setAddQuantity({...addQuantity, [c.id]: parseInt(e.target.value) || 1})}
                          />
                          <button 
                            className="btn-success px-2 py-1 h-fit text-xs font-medium" 
                            onClick={() => {
                               handleLinkComponent(selectedProject.id, c.id, addQuantity[c.id] || 1);
                               setSearchTerm("");
                            }}
                            disabled={isPending}
                          > Añadir </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <h4 className="mb-3 font-medium flex items-center gap-2">
                <FolderOpen size={16} className="text-primary"/> Componentes Asociados
              </h4>
              <div className="history-list max-h-64 overflow-y-auto pr-2">
                {(!selectedProject.components || selectedProject.components.length === 0) ? (
                  <p className="empty-msg">No hay componentes en este proyecto.</p>
                ) : (
                  selectedProject.components.map((comp: any) => (
                    <div key={comp.id} className="history-item glass flex gap-3 items-center p-3" style={{ borderLeft: `3px solid var(--primary)` }}>
                      <div className="bg-primary/20 text-primary font-bold rounded-md px-2 py-1 text-sm min-w-[2.5rem] text-center">
                        {comp.project_quantity}x
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="block truncate">{comp.name}</strong>
                        <span className="text-xs text-muted block truncate">{comp.category} • Ref: {comp.part_number || 'N/A'}</span>
                      </div>
                      <button 
                        className="btn-danger p-1.5 rounded-md h-fit shrink-0 transition-transform hover:scale-105" 
                        onClick={() => handleUnlinkComponent(selectedProject.id, comp.id)}
                        disabled={isPending}
                        title="Remover"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="form-actions mt-6">
              <button type="button" className="btn-secondary w-full" onClick={() => setSelectedProjectId(null)}>Cerrar Panel</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
