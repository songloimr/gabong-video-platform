import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { siteSettings } from '../../database/schema';
import { SiteSettingsResponse } from './dto/site-settings.dto';

export interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
}

export interface UploadConfig {
    maxUploadSizeMb: number;
    maxVideoDuration: number;
    maxFilesPerUpload: number;
}

export interface FFmpegConfig {
    path: string;
    maxProcesses: number;
    preset: string;
}

export interface VideoFormatConfig {
    allowedMimeTypes: string[];
    allowedExtensions: string[];
}

const DEFAULT_SETTINGS: Record<string, any> = {
    // General settings
    age_verification_enabled: false,
    google_analytics_code: '',
    custom_head_html: '',
    custom_body_html: '',
    // Upload settings
    max_upload_size_mb: 500,
    max_video_duration: 900,
    max_files_per_upload: 5,
    allowed_video_formats: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
        'video/x-msvideo',
    ],
    // R2 Storage settings
    r2_account_id: '',
    r2_access_key_id: '',
    r2_secret_access_key: '',
    r2_bucket: '',
    // FFmpeg settings
    ffmpeg_path: '',
    ffmpeg_max_processes: 1,
    ffmpeg_preset: 'medium',
    // Cache settings
    cache_ttl_minutes: 15,
    // Rate limit settings
    global_rate_limit_requests: 15,
    global_rate_limit_seconds: 60,
    // Upload restriction settings
    new_account_wait_hours: 24,
    daily_upload_limit: 2,
    // Comment rate limit settings
    comment_cooldown_seconds: 30,
    comment_daily_limit: 30,
};

@Injectable()
export class SiteSettingsService implements OnModuleInit {
    private readonly logger = new Logger(SiteSettingsService.name);
    private settingsCache: Map<string, any> = new Map();
    private cacheWarmed = false;

    constructor(private readonly drizzle: DrizzleService) { }

    async onModuleInit() {
        // Pre-warm cache on startup
        await this.warmCache();
    }

    private async warmCache() {
        try {
            const settings = await this.getSettings();
            for (const [key, value] of Object.entries(settings)) {
                this.settingsCache.set(key, value);
            }
            this.cacheWarmed = true;
            this.logger.log('Settings cache warmed successfully');
        } catch (error) {
            this.logger.error(`Failed to warm settings cache: ${error.message}`);
        }
    }

    async getSetting<T = any>(key: string): Promise<T | null> {
        // Check cache first
        if (this.settingsCache.has(key)) {
            return this.settingsCache.get(key);
        }

        try {
            const [setting] = await this.drizzle.db
                .select()
                .from(siteSettings)
                .where(eq(siteSettings.key, key))
                .limit(1);

            if (setting) {
                this.settingsCache.set(key, setting.value);
                return setting.value as T;
            }
        } catch (error) {
            this.logger.error(`Error getting setting ${key}: ${error.message}`);
        }

        // Return default value if available
        if (key in DEFAULT_SETTINGS) {
            return DEFAULT_SETTINGS[key] as T;
        }

        return null;
    }

    async getSettings(keys?: string[]): Promise<Record<string, any>> {
        try {
            let query = this.drizzle.db.select().from(siteSettings);

            if (keys && keys.length > 0) {
                // Filter by keys if provided
                const results = await query;
                const filtered = results.filter((s) => keys.includes(s.key));
                const dbSettings = this.mapToObject(filtered);

                // Merge with defaults for requested keys
                const result: Record<string, any> = {};
                for (const key of keys) {
                    result[key] = dbSettings[key] ?? DEFAULT_SETTINGS[key] ?? null;
                }
                return result;
            }

            const results = await query;
            const dbSettings = this.mapToObject(results);

            // Merge database settings with defaults
            return { ...DEFAULT_SETTINGS, ...dbSettings };
        } catch (error) {
            this.logger.error(`Error getting settings: ${error.message}`);
            return { ...DEFAULT_SETTINGS };
        }
    }

    async getAllPublicSettings(): Promise<SiteSettingsResponse> {
        const publicKeys = [
            'age_verification_enabled',
            'google_analytics_code',
            'custom_head_html',
            'custom_body_html',
            'max_upload_size_mb',
            'max_video_duration',
            'allowed_video_formats',
        ];

        const settings = await this.getSettings(publicKeys);
        return settings as SiteSettingsResponse;
    }

    async getAllAdminSettings(): Promise<SiteSettingsResponse> {
        const settings = await this.getSettings();
        return settings as SiteSettingsResponse;
    }

    // Helper method for R2 storage configuration
    async getR2Config(): Promise<R2Config> {
        const settings = await this.getSettings([
            'r2_account_id',
            'r2_access_key_id',
            'r2_secret_access_key',
            'r2_bucket',
        ]);

        return {
            accountId: settings.r2_account_id || '',
            accessKeyId: settings.r2_access_key_id || '',
            secretAccessKey: settings.r2_secret_access_key || '',
            bucket: settings.r2_bucket || '',
        };
    }

    // Helper method for upload configuration
    async getUploadConfig(): Promise<UploadConfig> {
        const settings = await this.getSettings([
            'max_upload_size_mb',
            'max_video_duration',
            'max_files_per_upload',
        ]);

        return {
            maxUploadSizeMb: settings.max_upload_size_mb ?? 500,
            maxVideoDuration: settings.max_video_duration ?? 900,
            maxFilesPerUpload: settings.max_files_per_upload ?? 5,
        };
    }

    // Helper method for FFmpeg configuration
    async getFFmpegConfig(): Promise<FFmpegConfig> {
        const settings = await this.getSettings([
            'ffmpeg_path',
            'ffmpeg_max_processes',
            'ffmpeg_preset',
        ]);

        return {
            path: settings.ffmpeg_path || '',
            maxProcesses: settings.ffmpeg_max_processes ?? 1,
            preset: settings.ffmpeg_preset || 'medium',
        };
    }

    // Helper method for video format configuration
    async getVideoFormatConfig(): Promise<VideoFormatConfig> {
        const formats = await this.getSetting<string[]>('allowed_video_formats');
        const allowedMimeTypes = formats ?? DEFAULT_SETTINGS.allowed_video_formats;

        // Map MIME types to extensions
        const mimeToExt: Record<string, string> = {
            'video/mp4': '.mp4',
            'video/webm': '.webm',
            'video/ogg': '.ogg',
            'video/quicktime': '.mov',
            'video/x-msvideo': '.avi',
            'video/x-matroska': '.mkv',
            'video/3gpp': '.3gp',
            'video/x-flv': '.flv',
            'video/x-ms-wmv': '.wmv',
        };

        const allowedExtensions = allowedMimeTypes
            .map((mime: string) => mimeToExt[mime])
            .filter(Boolean);

        return {
            allowedMimeTypes,
            allowedExtensions,
        };
    }

    async updateSetting(key: string, value: any): Promise<void> {
        try {
            const [existing] = await this.drizzle.db
                .select()
                .from(siteSettings)
                .where(eq(siteSettings.key, key))
                .limit(1);

            if (existing) {
                await this.drizzle.db
                    .update(siteSettings)
                    .set({
                        value,
                        updated_at: new Date(),
                    })
                    .where(eq(siteSettings.key, key));
            } else {
                await this.drizzle.db.insert(siteSettings).values({
                    key,
                    value,
                });
            }

            // Update cache
            this.settingsCache.set(key, value);
        } catch (error) {
            this.logger.error(`Error updating setting ${key}: ${error.message}`);
            throw error;
        }
    }

    async updateSettings(settings: Record<string, any>): Promise<void> {
        const promises = Object.entries(settings).map(([key, value]) =>
            this.updateSetting(key, value),
        );

        await Promise.all(promises);
    }

    clearCache() {
        this.settingsCache.clear();
        this.cacheWarmed = false;
    }

    isCacheWarmed(): boolean {
        return this.cacheWarmed;
    }

    private mapToObject(settings: any[]): Record<string, any> {
        const result: Record<string, any> = {};
        for (const setting of settings) {
            result[setting.key] = setting.value;
        }
        return result;
    }
}

