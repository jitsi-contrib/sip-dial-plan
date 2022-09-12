// ----------------------------------------------------------------------------
// sip-dial-plan.ts
// ----------------------------------------------------------------------------
import { TOKEN_ALGORITHM, TOKEN_SECRET } from "./config.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import { verify } from "https://deno.land/x/djwt/mod.ts";

const HOSTNAME = "0.0.0.0";
const PORT = 9000;

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
function unauthorized(): Response {
  return new Response("Unauthorized", {
    status: Status.Unauthorized,
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
async function verifyToken(token: string) {
  let hash = "SHA-256";
  if (TOKEN_ALGORITHM === "HS512") hash = "SHA-512";

  const cryptoKey = await getCryptoKey(TOKEN_SECRET, hash);

  return verify(token, cryptoKey);
}

// ----------------------------------------------------------------------------
async function getDialPlan(qs: URLSearchParams) {
  const token = qs.get("token");
  if (!token) return unauthorized();

  try {
    const jwt = await verifyToken(token);
    console.log(jwt);
  } catch {
    return unauthorized();
  }

  return ok("ok");
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
