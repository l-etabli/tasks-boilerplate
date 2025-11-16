import type {
  FileGateway,
  UploadPrivateResult,
  UploadPublicResult,
} from "../../domain/shared/ports/FileGateway.js";

export type InMemoryFileStore = {
  publicFiles: Record<string, Buffer>;
  privateFiles: Record<string, Buffer>;
};

export const createInMemoryFileGateway = (): FileGateway & {
  store: InMemoryFileStore;
} => {
  const store: InMemoryFileStore = {
    publicFiles: {},
    privateFiles: {},
  };

  return {
    store,

    async uploadPublic(
      file: Buffer,
      key: string,
      _contentType: string,
    ): Promise<UploadPublicResult> {
      store.publicFiles[key] = file;
      return { url: `test://${key}` };
    },

    async uploadPrivate(file: Buffer, key: string): Promise<UploadPrivateResult> {
      store.privateFiles[key] = file;
      return { key };
    },

    async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
      if (!store.privateFiles[key]) {
        throw new Error(`File not found: ${key}`);
      }
      return `test://signed/${key}?expires=${Date.now() + expiresInSeconds * 1000}`;
    },

    async delete(key: string): Promise<void> {
      delete store.publicFiles[key];
      delete store.privateFiles[key];
    },
  };
};
