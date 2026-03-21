import prisma from "@/lib/prisma";
import MovementsClient from "./MovementsClient";

export default async function MovementsPage() {
  const movements = await prisma.movement.findMany({
    include: {
      component: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <div className="movements-wrapper">
      <div className="page-header">
        <div>
          <h1>Registro de Movimientos</h1>
          <p>Historial completo de entradas, salidas y ajustes de inventario.</p>
        </div>
      </div>
      
      <MovementsClient initialMovements={movements} />
    </div>
  );
}
