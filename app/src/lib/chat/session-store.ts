import type { Message } from "./types";

interface Session {
  id: string;
  messages: Message[];
  createdAt: number;
  lastActivityAt: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

class SessionStore {
  private sessions: Map<string, Session> = new Map();

  generateId(): string {
    return crypto.randomUUID();
  }

  create(systemPrompt: string): Session {
    const id = this.generateId();
    const now = Date.now();
    const session: Session = {
      id,
      messages: [{ role: "system", content: systemPrompt }],
      createdAt: now,
      lastActivityAt: now,
    };
    this.sessions.set(id, session);
    this.cleanup();
    return session;
  }

  get(id: string): Session | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.lastActivityAt = Date.now();
    }
    return session;
  }

  addMessage(sessionId: string, message: Message): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
      session.lastActivityAt = Date.now();
    }
  }

  addMessages(sessionId: string, messages: Message[]): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(...messages);
      session.lastActivityAt = Date.now();
    }
  }

  getMessages(sessionId: string): Message[] {
    return this.sessions.get(sessionId)?.messages || [];
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now - session.lastActivityAt > SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionStore = new SessionStore();
