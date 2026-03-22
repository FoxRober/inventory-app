"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Database, ShieldAlert } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { resetDatabase, clearHistory } from "@/actions/system";
import "./settings.css";

export default function SettingsPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { addNotification } = useNotifications();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import-csv", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        addNotification(`¡Importación exitosa! Se procesaron ${data.count} componentes.`, "success");
        setTimeout(() => router.refresh(), 500);
      } else {
        addNotification(`Error: ${data.error}`, "error");
      }
    } catch (error) {
      addNotification("Error crítico durante la importación.", "error");
    } finally {
      setIsUploading(false);
      // Reset the input so the same file could be selected again if needed
      e.target.value = '';
    }
  };

  const handleResetDatabase = async () => {
    if (window.confirm("¿ESTÁS SEGURO? Esta acción ELIMINARÁ TODOS LOS DATOS (Componentes, Movimientos, Préstamos y Wishlist) y no se puede deshacer.")) {
      const res = await resetDatabase();
      if (res.success) {
        addNotification("Base de datos reseteada correctamente", "success");
        setTimeout(() => router.refresh(), 500);
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("¿Seguro que deseas eliminar TODO el historial de pruebas (Movimientos y Préstamos)? Tus componentes y proyectos quedarán intactos.")) {
      const res = await clearHistory();
      if (res.success) {
        addNotification("Historial limpiado correctamente", "success");
        setTimeout(() => router.refresh(), 500);
      } else {
        addNotification(`Error: ${res.error}`, "error");
      }
    }
  };

  return (
    <div className="settings-wrapper">
      <div className="page-header">
        <div>
          <h1>Configuración y Sistema</h1>
          <p>Gestiona los datos de tu inventario, copias de seguridad y opciones de la cuenta.</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-panel glass">
          <div className="panel-icon info">
            <Database size={24} />
          </div>
          <div className="panel-content">
            <h2>Exportar Backup (Excel)</h2>
            <p className="text-muted">Descarga un archivo .xlsx con el snapshot completo de Componentes, Wishlist, Préstamos y Proyectos.</p>
            <div className="mt-4">
              <a href="/api/export-csv" className="btn-primary inline-flex gap-2">
                <Download size={18} /> Exportar Inventario
              </a>
            </div>
          </div>
        </section>

      <section className="settings-panel glass">
          <div className="panel-icon info">
            <Upload size={24} />
          </div>
          <div className="panel-content">
            <h2>Restaurar Backup (Excel)</h2>
            <p className="text-muted">Sube tu archivo Backup (.xlsx) para restaurar todo de forma segura.</p>
            <div className="mt-4">
              <input 
                type="file" 
                accept=".xlsx"
                id="csv-upload"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
              <label htmlFor="csv-upload" className={`btn-secondary flex-row gap-2 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                <Upload size={18} /> {isUploading ? "Importando..." : "Seleccionar y Subir"}
              </label>
            </div>
          </div>
        </section>

        <section className="settings-panel glass border-danger">
          <div className="panel-icon danger">
            <ShieldAlert size={24} />
          </div>
          <div className="panel-content">
            <h2 className="text-danger">Zona de Peligro</h2>
            <p className="text-muted">Elimina todos los registros de movimientos, préstamos, wishlist y componentes.</p>
            <div className="mt-4 action-buttons" style={{ display: "flex", gap: "1rem" }}>
              <button className="btn-danger-outline" onClick={handleResetDatabase}>
                Resetear Toda la Base de Datos
              </button>
              <button className="btn-warning" style={{ color: '#000' }} onClick={handleClearHistory}>
                Limpiar Solo Historial (Pruebas)
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
