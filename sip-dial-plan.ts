// ----------------------------------------------------------------------------
// sip-dial-plan.ts
// ----------------------------------------------------------------------------
import { HOSTNAME, PORT, TOKEN_ALGORITHM, TOKEN_SECRET } from "./config.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts";
import { type Payload } from "https://deno.land/x/djwt/mod.ts";

const DIAL_PLAN = "./dial-plan.json";

// ----------------------------------------------------------------------------
function methodNotAllowed(): Response {
  return new Response("Method Not Allowed", {
    status: Status.MethodNotAllowed,
  });
}

// ----------------------------------------------------------------------------
function notFound(): Response {
  return new Response("Not Found", {
    status: Status.NotFound,
  });
}

// ----------------------------------------------------------------------------
function emptyList(): Response {
  return new Response("[]", {
    status: Status.OK,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ----------------------------------------------------------------------------
function ok(body: string): Response {
  return new Response(body, {
    status: Status.OK,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ----------------------------------------------------------------------------
async function getCryptoKey(secret: string, hash: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "HMAC",
      hash: hash,
    },
    true,
    ["sign", "verify"],
  );

  return cryptoKey;
}

// ----------------------------------------------------------------------------
async function verifyToken(token: string): Promise<Payload> {
  let hash = "SHA-256";
  if (TOKEN_ALGORITHM === "HS512") hash = "SHA-512";

  const cryptoKey = await getCryptoKey(TOKEN_SECRET, hash);
  const jwt = await verify(token, cryptoKey);

  return jwt;
}

// ----------------------------------------------------------------------------
async function readDialPlan(): Promise<Response> {
  try {
    const json = await Deno.readTextFile(DIAL_PLAN);
    return ok(json);
  } catch {
    return emptyList();
  }
}

// ----------------------------------------------------------------------------
async function getDialPlan(qs: URLSearchParams): Promise<Response> {
  const token = qs.get("jwt");
  if (!token) return emptyList();

  let jwt: Payload;

  try {
    jwt = await verifyToken(token);
  } catch {
    return emptyList();
  }

  try {
    if (jwt.context.user.affiliation === "owner") return readDialPlan();
  } catch {
    // no affiliation field in token
  }

  try {
    if (
      jwt.context.user.moderator === "true" ||
      jwt.context.user.moderator === true
    ) {
      return readDialPlan();
    }
  } catch {
    // no moderator field in token
  }

  return emptyList();
}

// ----------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const qs = new URLSearchParams(url.search);

  if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed();
  if (path !== "/get-dial-plan") return notFound();

  return await getDialPlan(qs);
}

// ----------------------------------------------------------------------------
function main() {
  serve(handler, {
    hostname: HOSTNAME,
    port: PORT,
  });
}

// ----------------------------------------------------------------------------
main();
