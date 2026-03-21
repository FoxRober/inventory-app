"use client";

import { useState } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "./movements.css";

export default function MovementsClient({ initialMovements }: { initialMovements: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const filteredMovements = initialMovements.filter(mov => {
    const matchesSearch = 
      mov.component.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (mov.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "ALL" || mov.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="movements-content glass panel">
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por componente, notas..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} className="text-muted" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos los Movimientos</option>
              <option value="COMPRA">Compras / Entradas</option>
              <option value="USO">Uso / Salidas</option>
              <option value="PERDIDA">Pérdidas</option>
              <option value="DANO">Daños</option>
              <option value="DEVOLUCION">Devoluciones</option>
              <option value="AJUSTE_MANUAL">Ajustes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Componente</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Notas adicionales</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">No se encontraron movimientos que coincidan con la búsqueda.</td>
              </tr>
            ) : (
              filteredMovements.map(mov => {
                const isEntry = mov.type === "COMPRA" || mov.type === "DEVOLUCION" || (mov.type === "AJUSTE_MANUAL" && mov.quantity > 0);
                return (
                  <tr key={mov.id}>
                    <td>
                      <div className="text-main font-medium">
                        {format(new Date(mov.date), "dd MMM yyyy", { locale: es })}
                      </div>
                      <div className="text-xs text-muted">
                        {format(new Date(mov.date), "HH:mm")}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{mov.component.name}</div>
                      {mov.component.part_number && (
                        <div className="text-xs text-muted">Ref: {mov.component.part_number}</div>
                      )}
                    </td>
                    <td>
                      <span className={`type-tag ${isEntry ? "entry" : "exit"}`}>
                        {isEntry ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        {mov.type}
                      </span>
                    </td>
                    <td>
                      <span className={`qty-indicator ${isEntry ? "success" : "danger"}`}>
                        {isEntry ? "+" : "-"}{Math.abs(mov.quantity)} {mov.component.unit}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{mov.notes || "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
