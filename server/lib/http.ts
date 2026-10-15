import 'server-only';

// Errors thrown inside a route() handler become JSON responses:
// { "error": "message", "errors": ["field problem", ...] }.
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: string[],
  ) {
    super(message);
  }
}

export function route<Ctx>(handler: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) {
        return Response.json({ error: e.message, ...(e.errors && { errors: e.errors }) }, { status: e.status });
      }
      console.error(e);
      return Response.json({ error: 'Something went wrong.' }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) return body;
  } catch {
    // Fall through to the error below.
  }
  throw new HttpError(400, 'Request body must be a JSON object.');
}

export function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
