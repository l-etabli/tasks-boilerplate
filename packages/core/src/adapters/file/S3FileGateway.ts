import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  FileGateway,
  UploadPrivateResult,
  UploadPublicResult,
} from "../../domain/ports/FileGateway.js";

export type S3Config = {
  endpoint: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBucket: string;
  privateBucket: string;
  publicUrl: string;
};

export const createS3FileGateway = (config: S3Config): FileGateway => {
  const client = new S3Client({
    region: config.region ?? "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return {
    async uploadPublic(
      file: Buffer,
      key: string,
      contentType: string,
    ): Promise<UploadPublicResult> {
      await client.send(
        new PutObjectCommand({
          Bucket: config.publicBucket,
          Key: key,
          Body: file,
          ContentType: contentType,
          // Note: R2 doesn't support ACLs - use bucket-level public access instead
        }),
      );

      return {
        url: `${config.publicUrl}/${key}`,
      };
    },

    async uploadPrivate(file: Buffer, key: string): Promise<UploadPrivateResult> {
      await client.send(
        new PutObjectCommand({
          Bucket: config.privateBucket,
          Key: key,
          Body: file,
        }),
      );

      return { key };
    },

    async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
      const command = new GetObjectCommand({
        Bucket: config.privateBucket,
        Key: key,
      });

      return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    },

    async delete(key: string): Promise<void> {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.privateBucket,
          Key: key,
        }),
      );
    },
  };
};
