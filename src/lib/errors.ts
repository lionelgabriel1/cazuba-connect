// Centralised error → friendly message mapping for Supabase/network errors.
import { toast } from "sonner";

export function friendlyError(err: unknown, fallback = "Ocorreu um erro inesperado."): string {
  if (!err) return fallback;
  const e = err as any;
  const status = e?.status ?? e?.statusCode ?? e?.code;
  const raw = (e?.message ?? String(e ?? "")).toString();
  const msg = raw.toLowerCase();

  // Network / offline
  if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("network request failed") || e?.name === "TypeError") {
    return "Sem ligação à internet. Verifique a sua rede e tente novamente.";
  }
  // Rate limit
  if (status === 429 || msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Demasiados pedidos. Aguarde alguns segundos e tente novamente.";
  }
  // Auth
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Credenciais inválidas. Verifique e tente novamente.";
  }
  if (msg.includes("email not confirmed")) return "Email ainda não confirmado.";
  if (msg.includes("user already registered") || msg.includes("already registered") || msg.includes("duplicate key")) {
    return "Já existe um registo com estes dados.";
  }
  if (status === 401 || msg.includes("unauthorized") || msg.includes("jwt")) {
    return "Sessão expirada. Por favor entre novamente.";
  }
  if (status === 403 || msg.includes("permission denied") || msg.includes("row-level security")) {
    return "Sem permissões para esta ação.";
  }
  if (status === 404) return "Recurso não encontrado.";
  if (typeof status === "number" && status >= 500) {
    return "O servidor está temporariamente indisponível. Tente novamente em breve.";
  }
  return raw || fallback;
}

export function toastError(err: unknown, fallback?: string) {
  toast.error(friendlyError(err, fallback));
}
