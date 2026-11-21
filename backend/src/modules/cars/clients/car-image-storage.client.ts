import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { storageConfig } from '../../../config/storage.config';

// The only place that talks to MinIO (§10). Services call this, never the SDK.
// The bucket and its GetObject-only policy are created by compose (minio-init).
@Injectable()
export class CarImageStorageClient {
  private readonly s3: S3Client;

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    this.s3 = new S3Client({
      endpoint: config.endpoint,
      region: 'us-east-1', // MinIO ignores it, the SDK requires one
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
  }

  // Browser-reachable URL from MINIO_PUBLIC_URL, never the internal endpoint.
  publicUrl(key: string): string {
    const base = this.config.publicUrl.replace(/\/$/, '');
    return `${base}/${this.config.bucket}/${key}`;
  }
}
