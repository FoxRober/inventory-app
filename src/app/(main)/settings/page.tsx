"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Database, ShieldAlert } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { resetDatabase } from "@/actions/system";
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
            <h2>Exportar Datos (CSV)</h2>
            <p className="text-muted">Descarga un archivo CSV con todo el catálogo de componentes actual.</p>
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
            <h2>Importar Datos (CSV)</h2>
            <p className="text-muted">Actualiza o inserta nuevos componentes usando un archivo CSV.</p>
            <div className="mt-4">
              <input 
                type="file" 
                accept=".csv"
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
            <div className="mt-4 action-buttons">
              <button className="btn-danger-outline" onClick={handleResetDatabase}>
                Resetear Base de Datos
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
