import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as xlsx from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let wb;
    try {
      wb = xlsx.read(buffer, { type: "buffer", cellDates: true });
    } catch (e) {
      return NextResponse.json({ success: false, error: "El archivo no se pudo leer. Asegúrate que sea un archivo .xlsx válido." }, { status: 400 });
    }

    const sanitizeRow = (row: any) => {
      const mapped: any = {};
      for (const key of Object.keys(row)) {
        const val = row[key];
        if (key === "created_at" || key === "updated_at") continue;
        if (val instanceof Date) {
          mapped[key] = val;
        } else if (typeof val === "number" && (key.includes("cost") || key.includes("price") || key.includes("quantity") || key === "min_stock")) {
          mapped[key] = val;
        } else {
          mapped[key] = val === null || val === undefined ? null : String(val).trim() || null;
        }
      }
      return mapped;
    };

    let importedCount = 0;
    const errors: string[] = [];

    // Components sheet (also fallback to first sheet if no named sheets)
    const compsSheetName = wb.SheetNames.includes("Componentes") ? "Componentes" : wb.SheetNames[0];
    const compsSheet = wb.Sheets[compsSheetName];

    if (compsSheet) {
      const components = xlsx.utils.sheet_to_json(compsSheet);
      for (const row of components as any[]) {
        if (!row.id || !row.name) continue;
        try {
          const mapped = sanitizeRow(row);
          // Ensure numeric fields
          mapped.current_quantity = parseInt(mapped.current_quantity) || 0;
          mapped.min_stock = parseInt(mapped.min_stock) || 0;
          if (mapped.approximate_cost) mapped.approximate_cost = parseFloat(mapped.approximate_cost);

          await prisma.component.upsert({
            where: { id: row.id },
            update: mapped,
            create: mapped,
          });
          importedCount++;
        } catch (err: any) {
          errors.push(`Componente ${row.name}: ${err.message}`);
        }
      }
    }

    // Wishlist sheet
    const wlSheet = wb.Sheets["Wishlist"];
    if (wlSheet) {
      const wls = xlsx.utils.sheet_to_json(wlSheet);
      for (const row of wls as any[]) {
        if (!row.id) continue;
        try {
          const mapped = sanitizeRow(row);
          mapped.quantity = parseInt(mapped.quantity) || 1;
          if (mapped.estimated_price) mapped.estimated_price = parseFloat(mapped.estimated_price);
          await prisma.wishlistItem.upsert({ where: { id: row.id }, update: mapped, create: mapped });
        } catch (err: any) {
          errors.push(`Wishlist ${row.id}: ${err.message}`);
        }
      }
    }

    // Projects sheet
    const projSheet = wb.Sheets["Proyectos"];
    if (projSheet) {
      const projects = xlsx.utils.sheet_to_json(projSheet);
      for (const row of projects as any[]) {
        if (!row.id) continue;
        try {
          const mapped = sanitizeRow(row);
          await (prisma as any).project.upsert({ where: { id: row.id }, update: mapped, create: mapped });
        } catch (_) { /* skip */ }
      }
    }

    // Loans sheet
    const loanSheet = wb.Sheets["Prestamos"];
    if (loanSheet) {
      const loans = xlsx.utils.sheet_to_json(loanSheet, { raw: false });
      for (const row of loans as any[]) {
        if (!row.id) continue;
        try {
          const mapped = sanitizeRow(row);
          mapped.quantity = parseInt(mapped.quantity) || 1;
          if (mapped.loan_date) mapped.loan_date = new Date(mapped.loan_date);
          if (mapped.expected_return_date) mapped.expected_return_date = new Date(mapped.expected_return_date);
          if (mapped.actual_return_date) mapped.actual_return_date = new Date(mapped.actual_return_date);
          await prisma.loan.upsert({ where: { id: row.id }, update: mapped, create: mapped as any });
        } catch (_) { /* skip */ }
      }
    }

    // Movements sheet
    const movSheet = wb.Sheets["Movimientos"];
    if (movSheet) {
      const movements = xlsx.utils.sheet_to_json(movSheet, { raw: false });
      for (const row of movements as any[]) {
        if (!row.id) continue;
        try {
          const mapped = sanitizeRow(row);
          mapped.quantity = parseInt(mapped.quantity) || 0;
          if (mapped.date) mapped.date = new Date(mapped.date);
          await prisma.movement.upsert({ where: { id: row.id }, update: mapped, create: mapped as any });
        } catch (_) { /* skip */ }
      }
    }

    const message = errors.length > 0
      ? `Importados: ${importedCount}. Advertencias: ${errors.slice(0, 3).join("; ")}`
      : `${importedCount} componentes importados correctamente.`;

    return NextResponse.json({ success: true, count: importedCount, message });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
