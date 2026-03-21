import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const components = await prisma.component.findMany({
      orderBy: { name: "asc" }
    });

    // Construir CSV
    const headers = [
      "ID",
      "Nombre",
      "Categoría",
      "Subcategoría",
      "Referencia",
      "Valor",
      "Encapsulado",
      "Cantidad",
      "Unidad",
      "Ubicación",
      "Stock Mínimo",
      "Descripción",
      "Notas"
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const cleanStr = String(str).replace(/"/g, '""');
      return `"${cleanStr}"`;
    };

    const rows = components.map((c: any) => [
      escapeCsv(c.id),
      escapeCsv(c.name),
      escapeCsv(c.category),
      escapeCsv(c.subcategory),
      escapeCsv(c.part_number),
      escapeCsv(c.value),
      escapeCsv(c.package),
      c.current_quantity,
      escapeCsv(c.unit),
      escapeCsv(c.location),
      c.min_stock,
      escapeCsv(c.description),
      escapeCsv(c.notes)
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="inventario_componentes.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "No se pudo exportar el CSV" }, { status: 500 });
  }
}
