import crypto from "crypto";
import { readJson, writeJson } from "./storage";

type SessionRecord = { token: string; subjectId: string; expiresAt: string };

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function readSessions(filename: string): Promise<SessionRecord[]> {
  try {
    return await readJson<SessionRecord[]>(filename, []);
  } catch {
    return [];
  }
}

async function writeSessions(filename: string, sessions: SessionRecord[]) {
  await writeJson(filename, sessions);
}

/** Expired sessions are dropped whenever the list is written, so the store does not grow forever. */
function live(sessions: SessionRecord[]) {
  const now = Date.now();
  return sessions.filter((s) => new Date(s.expiresAt).getTime() >= now);
}

export async function createSession(filename: string, subjectId: string): Promise<string> {
  const sessions = live(await readSessions(filename));
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  sessions.push({ token, subjectId, expiresAt });
  await writeSessions(filename, sessions);
  return token;
}

export async function getSubjectId(filename: string, token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const sessions = await readSessions(filename);
  const record = sessions.find((s) => s.token === token);
  if (!record) return null;
  if (new Date(record.expiresAt).getTime() < Date.now()) return null;
  return record.subjectId;
}

export async function destroySession(filename: string, token: string | undefined) {
  if (!token) return;
  const sessions = await readSessions(filename);
  await writeSessions(filename, live(sessions).filter((s) => s.token !== token));
}
