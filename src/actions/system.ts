"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resetDatabase() {
  try {
    // Delete in order to respect constraints if any (using Cascade in schema helps)
    await prisma.loan.deleteMany({});
    await prisma.movement.deleteMany({});
    await prisma.component.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    
    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/loans");
    revalidatePath("/wishlist");
    
    return { success: true };
  } catch (error: any) {
    console.error("Database reset error:", error);
    return { success: false, error: error.message };
  }
}

export async function clearHistory() {
  try {
    await prisma.movement.deleteMany({});
    await prisma.loan.deleteMany({});
    
    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/loans");
    revalidatePath("/movements");
    
    return { success: true };
  } catch (error: any) {
    console.error("History clear error:", error);
    return { success: false, error: error.message };
  }
}
