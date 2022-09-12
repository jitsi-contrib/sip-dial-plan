// ----------------------------------------------------------------------------
// sip-dial-plan.ts
// ----------------------------------------------------------------------------
import { serve } from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";

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
function getDialPlan(qs: URLSearchParams) {
  const token = qs.get("token");
  if (!token) return unauthorized();

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
