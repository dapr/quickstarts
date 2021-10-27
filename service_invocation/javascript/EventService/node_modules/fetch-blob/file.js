import Blob from './index.js';

const _File = class File extends Blob {
  #lastModified = 0;
  #name = '';

  /**
   * @param {*[]} fileBits
   * @param {string} fileName
   * @param {{lastModified?: number, type?: string}} options
   */// @ts-ignore
  constructor(fileBits, fileName, options = {}) {
    if (arguments.length < 2) {
      throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`);
    }
    super(fileBits, options);

    const modified = Number(options.lastModified);
    this.#lastModified = Number.isNaN(modified) ? Date.now() : modified
    this.#name = fileName;
  }

  get name() {
    return this.#name;
  }

  get lastModified() {
    return this.#lastModified;
  }

  get [Symbol.toStringTag]() {
    return "File";
  }
}

/** @type {typeof globalThis.File} */// @ts-ignore
export const File = _File;
export default File;
