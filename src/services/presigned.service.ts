import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface PresignedClient {
  getUploadURL(key: string): Promise<string>;
  getDownloadURL(key: string): Promise<string>;
}

const EXPIRES_IN_SECONDS: number = 60;

export class PresignedService implements PresignedClient {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    if (!bucketName || !region) {
      throw new Error('Missing AWS in .env file');
    }

    this.bucketName = bucketName;
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  getUploadURL = async (key: string = ''): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: 'image/jpeg',
    });

    return await getSignedUrl(this.client, command, {
      expiresIn: EXPIRES_IN_SECONDS,
    });
  };

  getDownloadURL = async (key: string): Promise<string> => {
    if (!key) {
      return '';
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.client, command, {
      expiresIn: EXPIRES_IN_SECONDS,
    });
  };
}
