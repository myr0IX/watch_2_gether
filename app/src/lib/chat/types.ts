/**
 * Types centraux du système de chat
 */

import { AssistantMessage$inboundSchema } from "@mistralai/mistralai/models/components";
import z from "zod";

/**
 * Structure d'un appel de tool fourni par l'IA
 */
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}


export type Message = any;

/**
 * Chunk de texte envoyé dans le stream de réponse
 */
export interface TextChunk {
  type: "text_chunk";
  content: string;
}

/**
 * Chunk de tool envoyé dans le stream de réponse
 */
export interface ToolChunk {
  type: "tool";
  name: string;
  data: unknown;
}

/**
 * Chunk d'erreur envoyé dans le stream de réponse
 */
export interface ErrorChunk {
  type: "error";
  content: string;
}

/**
 * Union type de tous les types de chunks possibles
 */
export type StreamChunk = TextChunk | ToolChunk | ErrorChunk;

/**
 * Résultat d'une validation de messages
 */
export interface ValidationResult {
  isValid: boolean;
  validMessages: Message[];
  error?: string;
}

/**
 * Buffer interne pour accumuler les arguments d'un tool call
 */
export interface ToolBuffer {
  name: string;
  arguments: string;
}

/**
 * Résultat du traitement d'un stream AI
 */
export interface StreamProcessingResult {
  textContent: string;
  toolCalls: ToolCall[];
}

export type AssistantMessage = z.infer<typeof AssistantMessage$inboundSchema._getType>;
