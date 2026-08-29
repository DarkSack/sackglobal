// Prueba del filtro de palabras obscenas del cliente.
//
//   npm run check:profanity
//
// Cubre tres cosas: que detecte lo que debe, que no se le escape por
// leetspeak, y —lo que mas duele en produccion— que no bloquee palabras
// normales. Node ejecuta el .ts directamente, sin runner ni dependencias.
const { findProfanity } = await import("../src/lib/profanity.ts");

const casos = [
  // [texto, debe detectar]
  ["hola que tal", false],
  ["eres un pendejo", true],
  ["ERES UN PENDEJO", true],
  ["p3nd3j0 con leet", true],
  ["put@ madre", true],
  ["$hit", true],
  ["no mames wey", false],
  ["esto es una mierda", true],
  ["what the fuck", true],
  ["fuuuck alargado", false],
  // El fallo que arreglamos: "cono" es una palabra normal
  ["un cono de helado", false],
  ["conos de trafico", false],
  ["que coño haces", true],
  ["menudo coñazo", true],
  // Retiradas por ambiguas
  ["voy a coger el autobus", false],
  ["mi gato pussy", false],
  ["el cock del corral", false],
  // Compuestas que sí quedan
  ["what a dickhead", true],
  ["hijoputa", true],
  ["computadora", false],
  ["reputacion", false],
  ["analisis", false],
  ["clasificar", false],
];

let fallos = 0;
for (const [texto, esperado] of casos) {
  const hit = findProfanity(texto);
  const ok = (hit.length > 0) === esperado;
  if (!ok) fallos++;
  console.log(`${ok ? "ok  " : "FALLO"}  ${esperado ? "bloquea" : "permite"}  "${texto}"${hit.length ? "  -> " + hit.join(",") : ""}`);
}
console.log(`\n${casos.length - fallos}/${casos.length} correctos`);
process.exit(fallos ? 1 : 0);
