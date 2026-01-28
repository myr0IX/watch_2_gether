/**
 * Validation des messages dans le système de chat
 */

import type { Message, ValidationResult } from "./types";

/**
 * Vérifie si un message a du contenu valide
 * - Les messages système sont toujours valides
 * - Les autres messages doivent avoir du contenu non-vide
 */
export function hasValidContent(message: Message): boolean {
  if (message.role === "system") {
    return true;
  }
  return message.content.trim().length > 0;
}

/**
 * Filtre les messages pour ne garder que ceux avec du contenu valide
 */
export function filterValidMessages(messages: Message[]): Message[] {
  return messages.filter(hasValidContent);
}

/**
 * Vérifie qu'il y a au moins un message utilisateur ou assistant avec du contenu
 */
export function hasUserOrAssistantMessage(messages: Message[]): boolean {
  return messages.some(
    (msg) =>
      (msg.role === "user" || msg.role === "assistant") &&
      msg.content &&
      msg.content.trim().length > 0
  );
}

/**
 * Valide une liste de messages complète
 * Retourne un objet ValidationResult avec isValid et les messages valides
 * ou une erreur descriptive
 */
export function validateMessages(messages: unknown[]): ValidationResult {
  // Vérifier qu'au moins un message est fourni
  if (!messages || (Array.isArray(messages) && messages.length === 0)) {
    return {
      isValid: false,
      validMessages: [],
      error: "Aucun message fourni",
    };
  }

  if (!Array.isArray(messages)) {
    return {
      isValid: false,
      validMessages: [],
      error: "Les messages doivent être un tableau",
    };
  }

  // Filtrer les messages valides
  const validMessages = filterValidMessages(messages as Message[]);

  // Vérifier qu'il y a au moins un message user ou assistant
  if (!hasUserOrAssistantMessage(validMessages)) {
    return {
      isValid: false,
      validMessages: [],
      error: "Au moins un message utilisateur ou assistant avec du contenu est requis",
    };
  }

  return {
    isValid: true,
    validMessages,
  };
}
