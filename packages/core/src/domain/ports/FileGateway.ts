export type UploadPublicResult = {
  url: string;
};

export type UploadPrivateResult = {
  key: string;
};

export type FileGateway = {
  uploadPublic(file: Buffer, key: string, contentType: string): Promise<UploadPublicResult>;
  uploadPrivate(file: Buffer, key: string): Promise<UploadPrivateResult>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
};
