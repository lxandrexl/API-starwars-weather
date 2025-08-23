export const ddbDoc = { send: jest.fn() };
export const cognito = { send: jest.fn() };

// por si exportas helpers para envolver funciones con X-Ray
export const wrapXRay = <T extends (...a: any[]) => any>(fn: T) => fn;
