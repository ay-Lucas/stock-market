import app from "../src/server";

// @ts-ignore
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function handler(req: any, res: any) {
  // Let Express handle the request
  // @ts-ignore - Express app is compatible with (req, res)
  return app(req, res);
}
