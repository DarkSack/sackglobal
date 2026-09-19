// ══════════════════════════════════════════════════════════════════
// /now — CONTENIDO CURADO A MANO
//
// `building` apunta a repos por nombre. Si un repo deja de existir o
// se archiva, desaparece solo de la página: no hace falta acordarse.
//
// "Using lately" no se escribe aquí: se calcula a partir de las
// tecnologías de los repos con commits en los últimos 30 días.
// ══════════════════════════════════════════════════════════════════

export interface NowItem {
  text: string;
  /** Solo se muestra en desarrollo hasta que se rellene de verdad. */
  pending?: boolean;
}

export const now = {
  /** Fecha de la última revisión manual de esta página (AAAA-MM-DD). */
  updated: "2026-09-19",

  building: [
    {
      repo: "RPGRollSack",
      note: "Core + 23 addons en 1.0.0, compilando contra Paper 26.1.1. Lanzamiento comercial previsto para septiembre de 2026.",
    },
    {
      repo: "pc-remote",
      note: "El agente .NET tiene sus 9 módulos. Falta probar la app Kotlin en un móvil real y portar ventanas y procesos.",
    },
  ],

  learning: [
    { text: "Completar: qué estás aprendiendo ahora mismo.", pending: true },
  ] as NowItem[],

  exploring: [
    { text: "Completar: ideas o tecnologías que estás tanteando.", pending: true },
  ] as NowItem[],
};
