import { generateInterpretation } from "./interpretation-engine.js";

/**
 * Punto único de integración para una personalización futura asistida por IA.
 *
 * En el MVP delega completamente en el motor local: no realiza solicitudes de
 * red, no transmite la consulta y no necesita claves privadas.
 *
 * Para conectar IA en el futuro, esta interfaz debe llamar exclusivamente a:
 * - un backend propio autenticado; o
 * - una función serverless que custodie la clave y aplique límites/validación.
 *
 * Nunca se debe incluir una clave de proveedor ni llamar una API pagada
 * directamente desde el navegador. El backend debe minimizar y validar los
 * datos enviados, filtrar temas sensibles y ofrecer el motor local como
 * alternativa cuando la red o el servicio no estén disponibles.
 */
export function generatePersonalizedReading(readingData) {
  return generateInterpretation(readingData);
}

