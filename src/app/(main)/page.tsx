import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  ShoppingCart, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import "./dashboard.css";
import Link from "next/link";
import AddToWishlistButton from "@/components/AddToWishlistButton";
export default async function DashboardPage() {
  // Fetch data concurrently
  const [components, activeLoans, wishlistItems, recentMovements] = await Promise.all([
    prisma.component.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.loan.count({
      where: { status: "PRESTADO" }
    }),
    prisma.wishlistItem.findMany({
      where: { status: "PENDIENTE" }
    }),
    prisma.movement.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { component: true }
    })
  ]);

  const totalComponents = components.length;
  
  // Encontrar componentes con bajo stock o agotados
  const lowStockComponents = components.filter(
    (c: any) => c.current_quantity <= c.min_stock && c.current_quantity > 0
  );
  
  const outOfStockComponents = components.filter(
    (c: any) => c.current_quantity === 0
  );

  const pendingWishlistCount = wishlistItems.length;
  const estimatedWishlistCost = wishlistItems.reduce((acc: number, item: any) => acc + ((item.estimated_price || 0) * item.quantity), 0);

  // Combinar stock bajo y agotado para la tabla, priorizando agotados
  const criticalStockList = [...outOfStockComponents, ...lowStockComponents].slice(0, 5);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>Panel de Resumen</h1>
        <p>Bienvenido a tu inventario. Aquí tienes el estado general de tus componentes.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon-wrapper info-bg">
            <Package className="text-info" size={24} />
          </div>
          <div className="stat-content">
            <h3>Componentes Únicos</h3>
            <h2>{totalComponents}</h2>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper danger-bg">
            <AlertTriangle className="text-danger" size={24} />
          </div>
          <div className="stat-content">
            <h3>Atención Requerida</h3>
            <h2>{outOfStockComponents.length + lowStockComponents.length}</h2>
            <p className="text-sm text-danger">{outOfStockComponents.length} agotados</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper warning-bg">
            <Clock className="text-warning" size={24} />
          </div>
          <div className="stat-content">
            <h3>Préstamos Activos</h3>
            <h2>{activeLoans}</h2>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper success-bg">
            <ShoppingCart className="text-success" size={24} />
          </div>
          <div className="stat-content">
            <h3>Wishlist Pendiente</h3>
            <h2>{pendingWishlistCount}</h2>
            {estimatedWishlistCost > 0 && <p className="text-sm text-success">~{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(estimatedWishlistCost)} previstos</p>}
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-column">
          <div className="panel glass">
            <div className="panel-header">
              <h3>Movimientos Recientes</h3>
              <Link href="/movements" className="view-all">Ver todos</Link>
            </div>
            <div className="movement-list">
              {recentMovements.length === 0 ? (
                <p className="empty-state">No hay movimientos recientes.</p>
              ) : (
                recentMovements.map((mov: any) => {
                  const isEntry = mov.type === "COMPRA" || mov.type === "DEVOLUCION";
                  return (
                    <div key={mov.id} className="movement-item">
                      <div className={`movement-icon ${isEntry ? "entry" : "exit"}`}>
                        {isEntry ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="movement-details">
                        <p className="movement-component">{mov.component.name}</p>
                        <p className="movement-type">
                          {mov.type} {mov.notes ? `• ${mov.notes}` : ""}
                        </p>
                      </div>
                      <div className="movement-meta">
                        <span className={`movement-qty ${isEntry ? "positive" : "negative"}`}>
                          {isEntry ? "+" : "-"}{mov.quantity}
                        </span>
                        <span className="movement-date">
                          {formatDistanceToNow(new Date(mov.date), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className="panel glass">
            <div className="panel-header">
              <h3>Stock Crítico</h3>
              <Link href="/inventory" className="view-all">Ir al Inventario</Link>
            </div>
            <div className="table-wrapper">
              {criticalStockList.length === 0 ? (
                <p className="empty-state">¡Todo bien! No hay componentes con stock crítico.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Componente</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalStockList.map(comp => (
                      <tr key={comp.id}>
                        <td className="font-medium">{comp.name}</td>
                        <td>{comp.current_quantity} {comp.unit}</td>
                        <td>
                          {comp.current_quantity === 0 ? (
                            <span className="badge-danger">Agotado</span>
                          ) : (
                            <span className="badge-warning">Bajo Stock (Mín: {comp.min_stock})</span>
                          )}
                        </td>
                        <td className="text-right">
                          <AddToWishlistButton 
                            componentName={comp.name} 
                            category={comp.category} 
                            suggestedQuantity={Math.max(1, comp.min_stock - comp.current_quantity)} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
