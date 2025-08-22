// core/utils/xray-bootstrap.ts
import { captureHTTPsGlobal, setContextMissingStrategy } from 'aws-xray-sdk-core';

// ⚠️ usar require en vez de `import * as http from 'http'`
/* eslint-disable @typescript-eslint/no-var-requires */
const http = require('node:http');
const https = require('node:https');
/* eslint-enable @typescript-eslint/no-var-requires */

let inited = false;
export function bootstrapXRay() {
  if (inited) return;
  inited = true;

  setContextMissingStrategy('LOG_ERROR'); // o 'IGNORE_ERROR' si prefieres
  captureHTTPsGlobal(http, true);
  captureHTTPsGlobal(https, true);
}
