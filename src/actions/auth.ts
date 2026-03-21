"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Hardcoded for simple single-user admin auth
const ADMIN_PASSWORD = "admin";

export async function login(prevState: any, formData: FormData) {
  const password = formData.get("password");
  
  if (password && password.toString().trim().length > 0) {
    const cookieStore = await cookies();
    cookieStore.set("auth_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return { success: true };
  }
  
  return { success: false, error: "Ingresa una contraseña válida" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}
