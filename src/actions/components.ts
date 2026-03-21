"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getComponents() {
  try {
    const components = await prisma.component.findMany({
      orderBy: { name: "asc" },
    });
    return components;
  } catch (error) {
    console.error("Error fetching components:", error);
    return [];
  }
}

export async function getComponentById(id: string) {
  try {
    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        projects: {
          include: { project: true }
        },
        movements: {
          orderBy: { date: "desc" },
        },
        loans: {
          orderBy: { loan_date: "desc" },
        },
      },
    });
    return component;
  } catch (error) {
    console.error("Error fetching component:", error);
    return null;
  }
}

export async function createComponent(data: any) {
  try {
    const newComponent = await prisma.component.create({
      data: {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        part_number: data.part_number,
        value: data.value,
        package: data.package,
        current_quantity: parseInt(data.current_quantity) || 0,
        unit: data.unit,
        location: data.location,
        min_stock: parseInt(data.min_stock) || 0,
        description: data.description,
        notes: data.notes,
        image_url: data.image_url,
      },
    });
    
    // Register initial stock as a movement if greater than 0
    if (newComponent.current_quantity > 0) {
      await prisma.movement.create({
        data: {
          component_id: newComponent.id,
          type: "COMPRA",
          quantity: newComponent.current_quantity,
          notes: "Stock inicial",
        }
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true, data: newComponent };
  } catch (error: any) {
    console.error("Error creating component:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteComponent(id: string) {
  try {
    await prisma.component.delete({
      where: { id },
    });
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting component:", error);
    return { success: false, error: error.message };
  }
}

// Movements
export async function createMovement(componentId: string, type: string, quantity: number, notes?: string) {
  try {
    const movement = await prisma.movement.create({
      data: {
        component_id: componentId,
        type,
        quantity,
        notes,
      },
    });

    // Update component current_quantity based on movement type
    let quantityChange = 0;
    if (type === "COMPRA" || type === "DEVOLUCION") {
      quantityChange = quantity;
    } else if (type === "USO" || type === "PERDIDA" || type === "DANO") {
      quantityChange = -quantity;
    } else if (type === "AJUSTE_MANUAL") {
      quantityChange = quantity; // Here quantity can be positive or negative
    }

    if (quantityChange !== 0) {
      await prisma.component.update({
        where: { id: componentId },
        data: {
          current_quantity: { increment: quantityChange }
        }
      });
    }

    revalidatePath("/inventory");
    revalidatePath("/");
    revalidatePath(`/inventory/${componentId}`);
    return { success: true, data: movement };
  } catch (error: any) {
    console.error("Error creating movement:", error);
    return { success: false, error: error.message };
  }
}

export async function updateComponent(id: string, data: any) {
  try {
    const updated = await prisma.component.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory,
        part_number: data.part_number,
        value: data.value,
        package: data.package,
        unit: data.unit,
        location: data.location,
        min_stock: parseInt(data.min_stock) || 0,
        description: data.description,
        notes: data.notes,
        image_url: data.image_url,
      },
    });
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating component:", error);
    return { success: false, error: error.message };
  }
}
