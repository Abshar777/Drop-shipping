import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

type SessionRecord = { token: string; subjectId: string; expiresAt: string };

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionPath(filename: string) {
  return path.join(process.cwd(), "data", filename);
}

async function readSessions(filename: string): Promise<SessionRecord[]> {
  try {
    const raw = await fs.readFile(sessionPath(filename), "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeSessions(filename: string, sessions: SessionRecord[]) {
  await fs.writeFile(sessionPath(filename), JSON.stringify(sessions, null, 2), "utf-8");
}

export async function createSession(filename: string, subjectId: string): Promise<string> {
  const sessions = await readSessions(filename);
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
  await writeSessions(filename, sessions.filter((s) => s.token !== token));
}
