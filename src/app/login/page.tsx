"use client";

import { useActionState, useEffect } from "react";
import { login } from "@/actions/auth";
import { LogIn } from "lucide-react";
import "./login.css";

const initialState = { success: false, error: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  useEffect(() => {
    if (state.success) {
      window.location.href = "/";
    }
  }, [state.success]);

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <div className="icon-wrapper">
            <LogIn size={28} className="text-primary" />
          </div>
          <h1>Inventario Pro</h1>
          <p>Ingresa la contraseña de administrador</p>
        </div>

        <form action={formAction} className="login-form">
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              autoFocus
              className="login-input"
              disabled={isPending}
            />
          </div>

          {state.error && <div className="error-message">{state.error}</div>}

          <button type="submit" className="login-btn" disabled={isPending}>
            {isPending ? "Ingresando..." : "Entrar al Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}
