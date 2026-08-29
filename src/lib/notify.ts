import type { SweetAlertIcon } from "sweetalert2";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// ── Paleta compartida con el tema del proyecto ────────────────────
const COLORS = {
  bg: "#141821",
  card: "#1a1f2b",
  border: "#374052",
  text: "#e6edf3",
  muted: "#8b95a5",
  primary: "#4aa3ff",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#38bdf8",
};

// ══════════════════════════════════════════════════════════════════
// TOASTS (Toastify)
// ══════════════════════════════════════════════════════════════════

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastOptions {
  duration?: number;
  close?: boolean;
  gravity?: "top" | "bottom";
  position?: "left" | "right" | "center";
}

const VARIANT_BG: Record<ToastVariant, string> = {
  success: `linear-gradient(135deg, ${COLORS.success}, #16a34a)`,
  error: `linear-gradient(135deg, ${COLORS.danger}, #b91c1c)`,
  info: `linear-gradient(135deg, ${COLORS.info}, #0284c7)`,
  warning: `linear-gradient(135deg, ${COLORS.warning}, #d97706)`,
};

function baseToast(
  variant: ToastVariant,
  text: string,
  opts: ToastOptions = {}
) {
  Toastify({
    text,
    duration: opts.duration ?? 3200,
    close: opts.close ?? true,
    gravity: opts.gravity ?? "top",
    position: opts.position ?? "right",
    stopOnFocus: true,
    style: {
      background: VARIANT_BG[variant],
      color: "#fff",
      borderRadius: "10px",
      boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
      padding: "12px 16px",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
    },
  }).showToast();
}

export const toast = {
  success: (text: string, opts?: ToastOptions) =>
    baseToast("success", text, opts),
  error: (text: string, opts?: ToastOptions) =>
    baseToast("error", text, opts),
  info: (text: string, opts?: ToastOptions) => baseToast("info", text, opts),
  warning: (text: string, opts?: ToastOptions) =>
    baseToast("warning", text, opts),
};

// ══════════════════════════════════════════════════════════════════
// DIALOGS (SweetAlert2) — tema dark integrado
//
// SweetAlert2 y su CSS pesan mas que ningun otro paquete del proyecto y
// solo hacen falta cuando aparece un dialogo: confirmar un borrado o
// pedir login. Cargarlos de forma estatica obligaba a descargarlos en
// la primera visita aunque el usuario no llegara a ver ninguno.
//
// Se importan bajo demanda la primera vez que se abre un dialogo. La
// promesa se guarda, asi que a partir del segundo es instantaneo. Todas
// las funciones que los usan ya eran asincronas, de modo que la firma
// publica de este modulo no cambia.
// ══════════════════════════════════════════════════════════════════

type SwalMixin = Awaited<ReturnType<typeof buildSwal>>;

async function buildSwal() {
  const [{ default: Swal }] = await Promise.all([
    import("sweetalert2"),
    import("sweetalert2/dist/sweetalert2.min.css"),
  ]);

  return Swal.mixin({
    background: COLORS.card,
    color: COLORS.text,
    confirmButtonColor: COLORS.primary,
    cancelButtonColor: COLORS.border,
    buttonsStyling: true,
    customClass: {
      popup: "sg-swal-popup",
      title: "sg-swal-title",
      htmlContainer: "sg-swal-content",
      confirmButton: "sg-swal-confirm",
      cancelButton: "sg-swal-cancel",
      denyButton: "sg-swal-deny",
      actions: "sg-swal-actions",
      icon: "sg-swal-icon",
    },
  });
}

let swalPromise: Promise<SwalMixin> | null = null;

function getSwal(): Promise<SwalMixin> {
  swalPromise ??= buildSwal();
  return swalPromise;
}

export interface AlertOptions {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  timer?: number;
}

async function fireAlert(icon: SweetAlertIcon, opts: AlertOptions) {
  const Swal = await getSwal();
  return Swal.fire({ icon, ...opts });
}

export const alert = {
  info: (opts: AlertOptions) => fireAlert("info", opts),
  success: (opts: AlertOptions) => fireAlert("success", opts),
  error: (opts: AlertOptions) => fireAlert("error", opts),
  warning: (opts: AlertOptions) => fireAlert("warning", opts),
};

export interface ConfirmOptions {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  danger?: boolean;
}

export async function confirm(opts: ConfirmOptions = {}): Promise<boolean> {
  const SwalDark = await getSwal();
  const result = await SwalDark.fire({
    title: opts.title ?? "¿Estás seguro?",
    text: opts.text,
    icon: opts.icon ?? "question",
    showCancelButton: true,
    confirmButtonText: opts.confirmButtonText ?? "Sí, continuar",
    cancelButtonText: opts.cancelButtonText ?? "Cancelar",
    confirmButtonColor: opts.danger ? COLORS.danger : COLORS.primary,
    reverseButtons: true,
    focusCancel: opts.danger === true,
  });
  return result.isConfirmed;
}

// Prompt específico para pedir login con GitHub
export async function requireLoginPrompt(
  action: string,
  onLogin?: () => void | Promise<void>
): Promise<void> {
  const SwalDark = await getSwal();
  const result = await SwalDark.fire({
    icon: "info",
    title: "Sesión requerida",
    text: `Necesitas iniciar sesión con GitHub para ${action}.`,
    showCancelButton: true,
    confirmButtonText: "Entrar con GitHub",
    cancelButtonText: "Ahora no",
    reverseButtons: true,
  });
  if (result.isConfirmed && onLogin) await onLogin();
}
