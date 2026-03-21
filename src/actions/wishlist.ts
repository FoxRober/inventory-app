"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getWishlist() {
  try {
    const items = await prisma.wishlistItem.findMany({
      orderBy: { created_at: "desc" },
    });
    return items;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export async function createWishlistItem(data: any) {
  try {
    const newItem = await prisma.wishlistItem.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: parseInt(data.quantity) || 1,
        priority: data.priority || "MEDIA",
        estimated_price: data.estimated_price ? parseFloat(data.estimated_price) : null,
        store: data.store,
        url: data.url,
        reason: data.reason,
      },
    });

    revalidatePath("/wishlist");
    revalidatePath("/");
    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("Error creating wishlist item:", error);
    return { success: false, error: error.message };
  }
}

export async function updateWishlistItemStatus(id: string, status: "PENDIENTE" | "COMPRADO" | "DESCARTADO") {
  try {
    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/wishlist");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating wishlist item:", error);
    return { success: false, error: error.message };
  }
}
