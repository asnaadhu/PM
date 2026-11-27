import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const isProduction = process.env.NODE_ENV === "production";

// Development convenience: without ADMIN_PASSWORD the dev server accepts "admin".
// In production, admin endpoints stay locked until ADMIN_PASSWORD is configured.
const DEV_FALLBACK_PASSWORD = "admin";
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? "" : DEV_FALLBACK_PASSWORD);

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    isProduction
      ? "[auth] ADMIN_PASSWORD is not set: admin endpoints are disabled."
      : `[auth] ADMIN_PASSWORD is not set: using development password "${DEV_FALLBACK_PASSWORD}".`
  );
}

// Tokens are signed with ADMIN_TOKEN_SECRET; without it a per-process secret is used,
// so sessions simply expire when the server restarts.
const tokenSecret = process.env.ADMIN_TOKEN_SECRET || crypto.randomBytes(32).toString("hex");

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest();
}

function sign(payload: string) {
  return crypto.createHmac("sha256", tokenSecret).update(payload).digest("base64url");
}

export function adminAuthStatus(): "configured" | "development-default" | "disabled" {
  if (process.env.ADMIN_PASSWORD) return "configured";
  return adminPassword ? "development-default" : "disabled";
}

export function verifyAdminPassword(
  candidate: string
): { ok: true } | { ok: false; status: number; error: string } {
  if (!adminPassword) {
    return { ok: false, status: 503, error: "Administrator access is not configured on this server." };
  }
  // Compare fixed-length digests so the check runs in constant time.
  if (!candidate || !crypto.timingSafeEqual(sha256(candidate), sha256(adminPassword))) {
    return { ok: false, status: 401, error: "Incorrect administrator password." };
  }
  return { ok: true };
}

export function issueAdminToken() {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: expiresAt })).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(expiresAt).toISOString() };
}

function isValidToken(token: string): boolean {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.role === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !isValidToken(token)) {
    return res.status(401).json({ error: "Administrator sign-in required." });
  }
  next();
}
