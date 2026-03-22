"use client";

import { useState, useTransition } from "react";
import { Search, Filter, CheckCircle, XCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { markLoanAs } from "@/actions/loans";
import { useNotifications } from "@/context/NotificationContext";
import Modal from "@/components/Modal";
import LoanForm from "@/components/LoanForm";
import "./loans.css";

export default function LoansClient({ initialLoans }: { initialLoans: any[] }) {
  const [loans, setLoans] = useState(initialLoans);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { addNotification } = useNotifications();

  const filteredLoans = loans.filter(loan => {
    const matchesSearch =
      loan.component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.person.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || loan.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleReturn = (id: string, qty: number, person: string, compName: string) => {
    if (window.confirm(`¿Confirmar que ${person} devolvió ${qty}x ${compName}?`)) {
      startTransition(async () => {
        const res = await markLoanAs(id, "DEVUELTO");
        if (res.success) {
          setLoans(loans.map(l => l.id === id ? { ...l, status: "DEVUELTO", actual_return_date: new Date() } : l));
          addNotification("Préstamo devuelto correctamente", "success");
        } else {
          addNotification(`Error: ${res.error}`, "error");
        }
      });
    }
  };

  const handleLost = (id: string, qty: number, person: string, compName: string) => {
    if (window.confirm(`¿Seguro que deseas dar por perdido el préstamo de ${person} (${qty}x ${compName})? No se repondrá el stock.`)) {
      startTransition(async () => {
        const res = await markLoanAs(id, "PERDIDO");
        if (res.success) {
          setLoans(loans.map(l => l.id === id ? { ...l, status: "PERDIDO" } : l));
          addNotification("Préstamo marcado como perdido", "warning");
        } else {
          addNotification(`Error: ${res.error}`, "error");
        }
      });
    }
  };

  return (
    <div className="loans-content glass panel">
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por componente o persona..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} className="text-muted" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="PRESTADO">Prestados Activos</option>
              <option value="DEVUELTO">Devueltos</option>
              <option value="PERDIDO">Perdidos</option>
            </select>
          </div>
          <button className="btn-primary flex-row gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            <span>Nuevo Préstamo</span>
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fechas</th>
              <th>Persona</th>
              <th>Componente</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">No hay préstamos registrados con estos filtros.</td>
              </tr>
            ) : (
              filteredLoans.map(loan => (
                <tr key={loan.id} className={loan.status === 'PRESTADO' ? 'highlight-row' : ''}>
                  <td>
                    <div className="text-sm">
                      <span className="text-muted">Inicio:</span> {format(new Date(loan.loan_date), "dd MMM yy", { locale: es })}
                    </div>
                    {loan.actual_return_date ? (
                      <div className="text-sm text-success">
                        <span className="text-muted">Fin:</span> {format(new Date(loan.actual_return_date), "dd MMM yy", { locale: es })}
                      </div>
                    ) : (
                      <div className="text-sm text-warning">
                        <span className="text-muted">Esperado:</span> {loan.expected_return_date ? format(new Date(loan.expected_return_date), "dd MMM yy", { locale: es }) : "Sin definir"}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="font-medium text-main">{loan.person}</div>
                  </td>
                  <td>
                    <div className="font-medium">{loan.component.name}</div>
                    {loan.component.part_number && (
                      <div className="text-xs text-muted">Ref: {loan.component.part_number}</div>
                    )}
                  </td>
                  <td>
                    <span className={`qty-indicator ${loan.status === 'PRESTADO' ? 'warning' : 'neutral'}`}>
                      {loan.quantity} {loan.component.unit}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${loan.status.toLowerCase()}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    {loan.status === "PRESTADO" ? (
                      <div className="action-buttons text-right">
                        <button 
                          className="action-btn !text-success hover:!bg-success/10" 
                          title="Marcar como devuelto" 
                          onClick={() => handleReturn(loan.id, loan.quantity, loan.person, loan.component.name)}
                          disabled={isPending}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          className="action-btn !text-danger hover:!bg-danger/10" 
                          title="Marcar como perdido" 
                          onClick={() => handleLost(loan.id, loan.quantity, loan.person, loan.component.name)}
                          disabled={isPending}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right text-muted text-sm">
                        Completado
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Registrar Préstamo">
        <LoanForm onSuccess={() => { setIsCreateModalOpen(false); window.location.reload(); }} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
}
