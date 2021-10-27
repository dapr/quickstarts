if (module.parent && module.parent.id === 'internal/preload') {
  // Running unbundled as 'npm run playground'
  globalThis.__debug__ = true;
}

import('./index.mjs')
  .then(({ Temporal, Intl, toTemporalInstant }) => {
    globalThis.Temporal = { ...Temporal };
    Object.defineProperty(globalThis.Temporal, Symbol.toStringTag, {
      value: 'Temporal',
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.assign(globalThis.Intl, Intl);
    Object.defineProperty(Date.prototype, 'toTemporalInstant', {
      value: toTemporalInstant,
      writable: true,
      enumerable: false,
      configurable: true
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
