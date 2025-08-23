// tests/__mocks__/__core/logger.ts
const noop = () => {};
const L = {
  info: noop,
  warn: noop,
  error: noop,
  debug: noop,
  child: () => L,
};

export const logger = L;      // si lo exportas así en tu core
export default L;             // por si hay default
