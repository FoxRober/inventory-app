import { getComponents } from "@/actions/components";
import InventoryClient from "./InventoryClient";
import "./inventory.css";

export default async function InventoryPage() {
  const components = await getComponents();

  return (
    <div className="inventory-wrapper">
      <div className="page-header">
        <div>
          <h1>Inventario de Componentes</h1>
          <p>Gestiona todos tus componentes electrónicos, busca y filtra rápidamente.</p>
        </div>
      </div>
      
      <InventoryClient initialComponents={components} />
    </div>
  );
}
