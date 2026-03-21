"use client";

import { Search, Plus, Bell, LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";
import "./Topbar.css";

export default function Topbar() {
  const router = useRouter();

  return (
    <header className="topbar">
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar componentes (ej: 10k, NE555)..." 
          className="search-input"
        />
      </div>

      <div className="topbar-actions">
        <button className="btn-primary flex-row gap-2" onClick={() => router.push('/inventory')}>
          <Plus size={18} />
          <span>Añadir Rápido</span>
        </button>
        
        <div className="divider"></div>

        <button className="icon-btn" onClick={() => alert("¡No tienes notificaciones urgentes! Todo el stock está bajo control.")}>
          <Bell size={20} />
          <span className="badge">0</span>
        </button>

        <button className="icon-btn" onClick={() => logout()} title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
