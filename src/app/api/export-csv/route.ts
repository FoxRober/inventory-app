import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as xlsx from "xlsx";

export async function GET() {
  try {
    const components = await prisma.component.findMany();
    const projects = await prisma.project.findMany();
    const projectComponents = await prisma.projectComponent.findMany();
    const wishlist = await prisma.wishlistItem.findMany();
    const loans = await prisma.loan.findMany();
    const movements = await prisma.movement.findMany();

    const wb = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(components), "Componentes");
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(projects), "Proyectos");
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(projectComponents), "ProjectComponents");
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(wishlist), "Wishlist");
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(loans), "Prestamos");
    xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(movements), "Movimientos");

    const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="inventario_backup_${new Date().getTime()}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
