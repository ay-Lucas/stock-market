import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/server";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Let Express handle the request
  // @ts-ignore - Express app is compatible with (req, res)
  return app(req, res);
}

