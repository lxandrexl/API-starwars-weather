// docs/index.ts
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";
import fs from 'fs';
import path from 'path';

/** Encabezados comunes (incluye CORS si lo sirves públicamente) */
const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
};

/** Obtiene proto/host/stage desde el evento para construir la base del API */
function buildApiBaseUrl(evt: APIGatewayProxyEvent): string {
  const domain = (evt as any)?.requestContext?.domainName ?? "localhost";
  const stage  = (evt as any)?.requestContext?.stage ?? "dev";

  // cabeceras pueden venir con diferentes mayúsculas
  const h = Object.fromEntries(
    Object.entries(evt.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])
  );

  const xfProto = (h["x-forwarded-proto"] as string) || "https";
  return `${xfProto}://${domain}/${stage}`;
}

function readOpenApiYaml(): string {
  const file = path.join(__dirname, 'openapi.yml');   // ¡este archivo debe estar empacado!
  return fs.readFileSync(file, 'utf8');
}

/** Handler: sirve /docs (Swagger UI) y /docs/openapi.yml */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const rawPath = ((event as any).rawPath as string) || event.path || '/';
  if (rawPath.endsWith('/docs/openapi.yml')) {
    const yaml = readOpenApiYaml();
    return {
      statusCode: 200,
      headers: { ...baseHeaders, 'Content-Type': 'text/yaml' },
      body: yaml,
    };
  }
  const apiUrl     = buildApiBaseUrl(event);
  const openApiUrl = `${apiUrl}/docs/openapi.yml`;
  // servir Swagger UI
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '${openApiUrl}',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'BaseLayout'
      });
    };
  </script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { ...baseHeaders, "Content-Type": "text/html", "Cache-Control": "no-store" },
    body: html,
  };
};
