// src/http/find-route.ts
import { match } from 'path-to-regexp';

export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export type HttpMethod = typeof HttpMethods[keyof typeof HttpMethods];

export type Route<TEvent = unknown, TResult = unknown> = {
  path: string;
  method: HttpMethod;
  action: (event: TEvent) => Promise<TResult> | TResult;
  auth?: string; // header con API key
  options?: Record<string, unknown>;
};

export type FindRouteHit<TEvent = unknown, TResult = unknown> =
  | {
      action: Route<TEvent, TResult>['action'];
      params: Record<string, string>;
      options: Record<string, unknown>;
    }
  | null;

/** Busca la ruta que coincide con path+method; valida API key por header si se define `auth`. */
export function FindRoute<TEvent = unknown, TResult = unknown>(
  routes: Array<Route<TEvent, TResult>>,
  path: string,
  method: string,
  headers: Record<string, string | undefined> = {}
): FindRouteHit<TEvent, TResult> {
  // normaliza headers a minúscula
  const h: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(headers)) h[k.toLowerCase()] = v;

  const httpMethod = method.toUpperCase();

  for (const route of routes) {
    if (route.method !== httpMethod) continue;

    const m = match(route.path, { decode: decodeURIComponent })(path);
    if (!m) continue;

    if (route.auth) {
      const provided = h[route.auth.toLowerCase()];
      const expected = process.env.API_KEY ?? '';
      if (provided !== expected) return null;
    }

    return {
      action: route.action,
      params: (m.params as Record<string, string>) ?? {},
      options: route.options ?? {},
    };
  }

  return null;
}

// opcional: objeto helper para estilo `Http.FindRoute`
export const Http = { FindRoute, HttpMethods };

export default FindRoute;
