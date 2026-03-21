"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLoans() {
  try {
    const loans = await prisma.loan.findMany({
      orderBy: { loan_date: "desc" },
      include: {
        component: true,
      },
    });
    return loans;
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
}

export async function createLoan(data: any) {
  try {
    const newLoan = await prisma.loan.create({
      data: {
        component_id: data.component_id,
        quantity: parseInt(data.quantity),
        person: data.person,
        expected_return_date: data.expected_return_date ? new Date(data.expected_return_date) : null,
        notes: data.notes,
        status: "PRESTADO",
      },
    });

    // Update component quantity
    await prisma.component.update({
      where: { id: data.component_id },
      data: {
        current_quantity: { decrement: parseInt(data.quantity) }
      }
    });

    revalidatePath("/loans");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true, data: newLoan };
  } catch (error: any) {
    console.error("Error creating loan:", error);
    return { success: false, error: error.message };
  }
}

export async function markLoanAs(id: string, status: "DEVUELTO" | "PERDIDO") {
  try {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan || loan.status !== "PRESTADO") return { success: false, error: "Loan not active" };

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        status,
        actual_return_date: new Date(),
      },
    });

    if (status === "DEVUELTO") {
        await prisma.component.update({
            where: { id: loan.component_id },
            data: { current_quantity: { increment: loan.quantity } }
        });
    }

    revalidatePath("/loans");
    revalidatePath("/inventory");
    revalidatePath("/");
    return { success: true, data: updatedLoan };
  } catch (error: any) {
    console.error("Error updating loan:", error);
    return { success: false, error: error.message };
  }
}
