// ----------------------------------------------------------------------------
// sip-dial-plan.ts
// ----------------------------------------------------------------------------
import { HOSTNAME, PORT, TOKEN_ALGORITHM, TOKEN_SECRET } from "./config.ts";
import { STATUS_CODE } from "https://deno.land/std@0.224.0/http/status.ts";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { type Payload } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const DIAL_PLAN = "./dial-plan.json";

// ----------------------------------------------------------------------------
function methodNotAllowed(): Response {
  return new Response("Method Not Allowed", {
    status: STATUS_CODE.MethodNotAllowed,
  });
}

// ----------------------------------------------------------------------------
function notFound(): Response {
  return new Response("Not Found", {
    status: STATUS_CODE.NotFound,
  });
}

// ----------------------------------------------------------------------------
function emptyList(): Response {
  return new Response("[]", {
    status: STATUS_CODE.OK,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ----------------------------------------------------------------------------
function ok(body: string): Response {
  return new Response(body, {
    status: STATUS_CODE.OK,
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

  // @ts-expect-error TS2367
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
async function getDialPlan(req: Request): Promise<Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return emptyList();

  const token = authHeader.replace("Bearer ", "");
  if (!token) return emptyList();

  let jwt: Payload;

  try {
    jwt = await verifyToken(token);
  } catch {
    return emptyList();
  }

  try {
    // @ts-expect-error TS18046
    if (jwt.context.user.affiliation === "owner") return readDialPlan();
  } catch {
    // no affiliation field in token
  }

  try {
    if (
      // @ts-expect-error TS18046
      jwt.context.user.moderator === "true" ||
      // @ts-expect-error TS18046
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

  if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed();
  if (path !== "/get-dial-plan") return notFound();

  return await getDialPlan(req);
}

// ----------------------------------------------------------------------------
function main() {
  Deno.serve({
    hostname: HOSTNAME,
    port: PORT,
  }, handler);
}

// ----------------------------------------------------------------------------
main();
