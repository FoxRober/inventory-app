import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const text = await file.text();
    const rows = text.split('\n').filter(row => row.trim().length > 0);
    
    if (rows.length <= 1) {
      return NextResponse.json({ error: "El archivo parece estar vacío o no tener datos válidos" }, { status: 400 });
    }

    // Skip the first row (headers)
    const dataRows = rows.slice(1);
    let importedCount = 0;

    for (const row of dataRows) {
      // Basic CSV parsing respecting quotes
      const columns = [];
      let inQuotes = false;
      let currentString = "";
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"' && row[i+1] === '"') {
          currentString += '"';
          i++; // skip escaped quote
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          columns.push(currentString);
          currentString = "";
        } else {
          currentString += char;
        }
      }
      columns.push(currentString); // Push the last column

      if (columns.length < 2) continue; // Skip invalid rows

      // Map columns based on the export format we defined earlier
      // 0: ID, 1: Nombre, 2: Categoría, 3: Subcategoría, 4: Referencia, 5: Valor, 6: Encapsulado, 
      // 7: Cantidad, 8: Unidad, 9: Ubicación, 10: Stock Mínimo, 11: Descripción, 12: Notas
      const id = columns[0] && columns[0].trim() !== "" ? columns[0] : undefined;
      const name = columns[1];
      const category = columns[2] || "Categoría General";
      const quantity = parseInt(columns[7]) || 0;
      
      if (!name) continue;

      if (id) {
        // Try to update existing or create if it doesn't match format perfectly
        try {
          await prisma.component.upsert({
            where: { id },
            update: {
              name,
              category,
              subcategory: columns[3],
              part_number: columns[4],
              value: columns[5],
              package: columns[6],
              current_quantity: quantity,
              unit: columns[8] || "uds",
              location: columns[9],
              min_stock: parseInt(columns[10]) || 0,
              description: columns[11],
              notes: columns[12],
            },
            create: {
              id, // Might throw if invalid UUID, but handled by catch
              name,
              category,
              subcategory: columns[3],
              part_number: columns[4],
              value: columns[5],
              package: columns[6],
              current_quantity: quantity,
              unit: columns[8] || "uds",
              location: columns[9],
              min_stock: parseInt(columns[10]) || 0,
              description: columns[11],
              notes: columns[12],
            }
          });
          importedCount++;
        } catch (e) {
          // Fallback to purely creating new if ID is invalid UUID format
          await prisma.component.create({
            data: {
              name,
              category,
              subcategory: columns[3],
              part_number: columns[4],
              value: columns[5],
              package: columns[6],
              current_quantity: quantity,
              unit: columns[8] || "uds",
              location: columns[9],
              min_stock: parseInt(columns[10]) || 0,
              description: columns[11],
              notes: columns[12],
            }
          });
          importedCount++;
        }
      } else {
         // Create new directly
         await prisma.component.create({
          data: {
            name,
            category,
            subcategory: columns[3],
            part_number: columns[4],
            value: columns[5],
            package: columns[6],
            current_quantity: quantity,
            unit: columns[8] || "uds",
            location: columns[9],
            min_stock: parseInt(columns[10]) || 0,
            description: columns[11],
            notes: columns[12],
          }
        });
        importedCount++;
      }
    }

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Error procesando el archivo CSV" }, { status: 500 });
  }
}
