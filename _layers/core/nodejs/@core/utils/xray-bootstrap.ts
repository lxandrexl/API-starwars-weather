import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
// core/utils/xray-bootstrap.ts
/* eslint-disable @typescript-eslint/no-var-requires */
const http = require("node:http");
const https = require("node:https");
/* eslint-enable @typescript-eslint/no-var-requires */

let inited = false;

function shouldEnableXRay(): boolean {
  // No en local/offline o si está deshabilitado explícitamente
  if (process.env.AWS_XRAY_SDK_DISABLED === "1") return false;
  if (process.env.IS_OFFLINE === "true") return false;
  if (process.env.NODE_ENV === "local" || process.env.NODE_ENV === "test")
    return false;

  // En Lambda real, AWS expone esta var; en offline no.
  if (process.env._X_AMZN_TRACE_ID) return true;

  // Permite forzar on/off por variable, si la quieres usar
  if (process.env.XRAY_ENABLED === "true") return true;
  if (process.env.XRAY_ENABLED === "false") return false;

  // Por defecto, solo en entorno AWS (no local)
  return false;
}

export function bootstrapXRay() {
  if (inited) return;
  if (!shouldEnableXRay()) return; // <— clave: no tocar nada en local

  inited = true;

  // require perezoso para no cargar el SDK si no se usa
  // y evitar side-effects en bundlers/tests
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const xray =
    require("aws-xray-sdk-core") as typeof import("aws-xray-sdk-core");

  xray.setContextMissingStrategy("LOG_ERROR"); // o 'IGNORE_ERROR'
  xray.captureHTTPsGlobal(http, true);
  xray.captureHTTPsGlobal(https, true);
}
