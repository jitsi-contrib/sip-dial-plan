// ----------------------------------------------------------------------------
// sip-dial-plan.ts
// ----------------------------------------------------------------------------
import { serve } from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";

const HOSTNAME = "0.0.0.0";
const PORT = 9000;

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
function notFound(): Response {
  return new Response("Not Found", {
    status: Status.NotFound,
  });
}

// ----------------------------------------------------------------------------
function getDialPlan(req: Request) {
  return ok("ok");
}

// ----------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if ((req.method === "GET") && (path === "/get-dial-plan")) {
    return await getDialPlan(req);
  } else return notFound();
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
