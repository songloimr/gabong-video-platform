import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, lstatSync } from 'fs';
import { join, relative } from 'path';
import { SiteSettingsService, R2Config } from '../site-settings/site-settings.service';

@Injectable()
export class StorageService implements OnModuleInit {
    private s3Client: S3Client | null = null;
    private bucket: string = '';
    private readonly logger = new Logger(StorageService.name);
    private isInitialized = false;

    constructor(private readonly siteSettingsService: SiteSettingsService) { }

    async onModuleInit() {
        // Try to initialize on startup, but don't fail if settings aren't configured yet
        try {
            await this.ensureClient();
        } catch (error) {
            this.logger.warn(`R2 storage not initialized on startup: ${error.message}. Will retry on first use.`);
        }
    }

    private async ensureClient(): Promise<void> {
        if (this.isInitialized && this.s3Client) {
            return;
        }

        const config = await this.siteSettingsService.getR2Config();

        if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
            throw new Error('R2 storage credentials not configured. Please configure in Admin Settings.');
        }

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });

        this.bucket = config.bucket;
        this.isInitialized = true;
        this.logger.log('R2 storage client initialized successfully');
    }

    // Force re-initialization (useful when settings change)
    async reinitialize(): Promise<void> {
        this.isInitialized = false;
        this.s3Client = null;
        await this.ensureClient();
    }

    async testConnection(): Promise<{ success: boolean; message: string; bucketName?: string }> {
        try {
            // Get fresh config for testing
            const config = await this.siteSettingsService.getR2Config();

            if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucket) {
                return {
                    success: false,
                    message: 'R2 credentials not fully configured. Please fill in all required fields.',
                };
            }

            // Create a temporary client with current settings for testing
            const testClient = new S3Client({
                region: 'auto',
                endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                },
            });

            const command = new ListObjectsV2Command({
                Bucket: config.bucket,
                MaxKeys: 1,
            });
            await testClient.send(command);

            // If test succeeds, reinitialize the main client
            await this.reinitialize();

            return {
                success: true,
                message: 'Successfully connected to R2 storage',
                bucketName: config.bucket,
            };
        } catch (error) {
            this.logger.error(`R2 connection test failed: ${error.message}`);
            return {
                success: false,
                message: error.message || 'Failed to connect to R2 storage',
            };
        }
    }

    async uploadFile(buffer: Buffer, key: string, contentType: string) {
        await this.ensureClient();
        try {
            await this.s3Client!.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                }),
            );
            return this.getPublicUrl(key);
        } catch (error) {
            this.logger.error(`Error uploading file to R2: ${error.message}`);
            throw error;
        }
    }

    async uploadDirectory(localDir: string, r2Prefix: string) {
        await this.ensureClient();
        const files = this.getFilesRecursive(localDir);
        const uploadPromises = files.map(async (localPath) => {
            const relativePath = relative(localDir, localPath);
            const r2Key = join(r2Prefix, relativePath).replace(/\\/g, '/');
            const buffer = readFileSync(localPath);
            const contentType = this.getContentType(localPath);

            return this.uploadFile(buffer, r2Key, contentType);
        });

        await Promise.all(uploadPromises);
        return this.getPublicUrl(join(r2Prefix, 'master.m3u8').replace(/\\/g, '/'));
    }

    async listFiles(prefix: string) {
        await this.ensureClient();
        try {
            const listCommand = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
            });

            const listResponse = await this.s3Client!.send(listCommand);
            return listResponse.Contents || [];
        } catch (error) {
            this.logger.error(`Error listing files from R2: ${error.message}`);
            return [];
        }
    }

    async deleteFile(key: string) {
        await this.ensureClient();
        try {
            await this.s3Client!.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
        } catch (error) {
            this.logger.error(`Error deleting file from R2: ${error.message}`);
        }
    }

    async deleteDirectory(prefix: string) {
        await this.ensureClient();
        try {
            const listCommand = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
            });

            const listResponse = await this.s3Client!.send(listCommand);

            if (listResponse.Contents && listResponse.Contents.length > 0) {
                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: this.bucket,
                    Delete: {
                        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
                    },
                });

                await this.s3Client!.send(deleteCommand);
            }
        } catch (error) {
            this.logger.error(`Error deleting directory from R2: ${error.message}`);
        }
    }

    getPublicUrl(key: string) {
        return key;
    }

    private getFilesRecursive(dir: string): string[] {
        const files = readdirSync(dir);
        let results: string[] = [];

        files.forEach((file) => {
            const path = join(dir, file);
            const stat = lstatSync(path);

            if (stat.isDirectory()) {
                results = results.concat(this.getFilesRecursive(path));
            } else {
                results.push(path);
            }
        });

        return results;
    }

    private getContentType(filePath: string): string {
        if (filePath.endsWith('.m3u8')) return 'application/x-mpegURL';
        if (filePath.endsWith('.ts')) return 'video/MP2T';
        if (filePath.endsWith('.mp4')) return 'video/mp4';
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg'))
            return 'image/jpeg';
        if (filePath.endsWith('.png')) return 'image/png';
        return 'application/octet-stream';
    }
}

