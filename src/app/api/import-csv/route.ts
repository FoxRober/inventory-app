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
      wb = xlsx.read(buffer, { type: "buffer" });
    } catch(e) {
      return NextResponse.json({ success: false, error: "El archivo no es un Excel válido (.xlsx)." }, { status: 400 });
    }

    const sanitizeRow = (row: any) => {
      const mapped = { ...row };
      delete mapped.created_at;
      delete mapped.updated_at;
      if (mapped.approximate_cost) mapped.approximate_cost = parseFloat(mapped.approximate_cost);
      return mapped;
    };

    // Parse and upsert each sheet dynamically
    const compsSheet = wb.Sheets["Componentes"] || wb.Sheets[wb.SheetNames[0]];
    if (compsSheet) {
      const components = xlsx.utils.sheet_to_json(compsSheet);
      for (const row of components as any[]) {
        if (!row.id || !row.name) continue;
        const mapped = sanitizeRow(row);
        await prisma.component.upsert({ where: { id: row.id }, update: mapped, create: mapped });
      }
    }

    const projSheet = wb.Sheets["Proyectos"];
    if (projSheet) {
      const projects = xlsx.utils.sheet_to_json(projSheet);
      for (const row of projects as any[]) {
        if (!row.id) continue;
        const mapped = sanitizeRow(row);
        await prisma.project.upsert({ where: { id: row.id }, update: mapped, create: mapped });
      }
    }

    const pcSheet = wb.Sheets["ProjectComponents"];
    if (pcSheet) {
      const pcs = xlsx.utils.sheet_to_json(pcSheet);
      for (const row of pcs as any[]) {
        if (!row.id) continue;
        const mapped = sanitizeRow(row);
        await prisma.projectComponent.upsert({ where: { id: row.id }, update: mapped, create: mapped });
      }
    }

    const wlSheet = wb.Sheets["Wishlist"];
    if (wlSheet) {
      const wls = xlsx.utils.sheet_to_json(wlSheet);
      for (const row of wls as any[]) {
        if (!row.id) continue;
        const mapped = sanitizeRow(row);
        await prisma.wishlistItem.upsert({ where: { id: row.id }, update: mapped, create: mapped });
      }
    }

    const loanSheet = wb.Sheets["Prestamos"];
    if (loanSheet) {
      const loans = xlsx.utils.sheet_to_json(loanSheet);
      for (const row of loans as any[]) {
        if (!row.id) continue;
        const mapped = sanitizeRow(row);
        if (mapped.date) mapped.date = new Date(mapped.date);
        if (mapped.expected_return_date) mapped.expected_return_date = new Date(mapped.expected_return_date);
        await prisma.loan.upsert({ where: { id: row.id }, update: mapped, create: mapped as any });
      }
    }

    const movSheet = wb.Sheets["Movimientos"];
    if (movSheet) {
      const movements = xlsx.utils.sheet_to_json(movSheet);
      for (const row of movements as any[]) {
        if (!row.id) continue;
        const mapped = sanitizeRow(row);
        if (mapped.date) mapped.date = new Date(mapped.date);
        await prisma.movement.upsert({ where: { id: row.id }, update: mapped, create: mapped as any });
      }
    }
    
    return NextResponse.json({ success: true, count: compsSheet ? xlsx.utils.sheet_to_json(compsSheet).length : 0 });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
