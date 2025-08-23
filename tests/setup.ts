// Zona horaria estable para snapshots/fechas
process.env.TZ = 'UTC';

// Variables mínimas usadas por DAOs y usecases
process.env.APP_REGION = process.env.APP_REGION ?? 'us-east-1';
process.env.USER_POOL_ID = process.env.USER_POOL_ID ?? 'dummy';
process.env.USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID ?? 'dummy';
process.env.FUSION_TABLE = process.env.FUSION_TABLE ?? 'fusionTable-dev';
process.env.ALMACENADOS_TABLE = process.env.ALMACENADOS_TABLE ?? 'almacenadosTable-dev';

// Node 20 ya trae fetch, pero lo dejamos mockeable por defecto:
if (!global.fetch) {
  (global as any).fetch = jest.fn();
}

export {};