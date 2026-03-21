import prisma from "@/lib/prisma";
import WishlistClient from "./WishlistClient";

export default async function WishlistPage() {
  const items = await prisma.wishlistItem.findMany({
    orderBy: [
      { status: "asc" }, // PENDIENTE primero
      { created_at: "desc" }
    ]
  });

  return (
    <div className="wishlist-wrapper">
      <div className="page-header">
        <div>
          <h1>Lista de Deseos y Compras</h1>
          <p>Componentes que necesitas adquirir para futuros proyectos.</p>
        </div>
      </div>
      
      <WishlistClient initialItems={items} />
    </div>
  );
}
