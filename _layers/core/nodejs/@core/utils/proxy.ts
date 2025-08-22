import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

type ProxyOpts = {
  baseUrl: string;
  subPath?: (e: APIGatewayProxyEvent) => string;
  forwardBody?: boolean;
  forwardHeaders?: string[];
  extraHeaders?: Record<string, string>;
  method?: (e: APIGatewayProxyEvent) => string;
};

function pickHeaders(
  src: Record<string, string | undefined> | null | undefined,
  allow: string[]
) {
  if (!src || !allow.length) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(src)) {
    if (v == null) continue;
    if (allow.includes(k.toLowerCase())) out[k] = String(v);
  }
  return out;
}

function buildQs(e: APIGatewayProxyEvent): string {
  const params = new URLSearchParams();

  // simples
  if (e.queryStringParameters) {
    for (const [k, v] of Object.entries(e.queryStringParameters)) {
      if (v != null) params.append(k, v);
    }
  }
  // multi-valor
  if (e.multiValueQueryStringParameters) {
    for (const [k, arr] of Object.entries(e.multiValueQueryStringParameters)) {
      for (const v of arr ?? []) if (v != null) params.append(k, v);
    }
  }
  return params.toString();
}

export function externalProxy(opts: ProxyOpts) {
  const allow = (opts.forwardHeaders ?? []).map((h) => h.toLowerCase());

  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const qs = buildQs(event);
    const sub = opts.subPath ? opts.subPath(event) : '';
    const url = `${opts.baseUrl}${sub}${qs ? (sub.includes('?') ? '&' : '?') + qs : ''}`;

    const method = (opts.method ? opts.method(event) : event.httpMethod || 'GET').toUpperCase();
    const forwardBody = opts.forwardBody ?? !['GET', 'HEAD'].includes(method);

    const headers = {
      accept: 'application/json',
      ...(opts.extraHeaders || {}),
      ...pickHeaders(event.headers, allow),
      ...(forwardBody && event.body
        ? { 'content-type': event.headers?.['content-type'] ?? event.headers?.['Content-Type'] ?? 'application/json' }
        : {}),
    };

    const res = await fetch(url, {
      method,
      headers,
      body: forwardBody ? event.body : undefined, // ya es string; se reenvía tal cual
    });

    const text = await res.text().catch(() => '');
    const contentType = res.headers.get('content-type') || 'application/json';

    return {
      statusCode: res.status,
      headers: {
        'content-type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: text,
    };
  };
}
