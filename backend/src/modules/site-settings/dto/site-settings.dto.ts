import { IsNotEmpty, IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';
import { IsSecure } from '../../../common/validators';

export class UpdateSettingDto {
    @IsNotEmpty()
    @IsString()
    key: string;

    @IsNotEmpty()
    value: any;
}

export class UpdateSettingsDto {
    @IsNotEmpty()
    settings: Record<string, any>;
}

export class SiteSettingsResponse {
    // Branding settings
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @IsSecure()
    site_name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    @IsSecure()
    site_tagline?: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    site_url?: string;

    // General settings
    age_verification_enabled?: boolean;
    google_analytics_code?: string;
    custom_head_html?: string;
    custom_body_html?: string;

    // Upload settings
    max_upload_size_mb?: number;
    max_video_duration?: number;
    max_files_per_upload?: number;

    // R2 Storage
    r2_account_id?: string;
    r2_access_key_id?: string;
    r2_bucket?: string;

    // FFmpeg
    ffmpeg_path?: string;
    ffmpeg_max_processes?: number;
    ffmpeg_preset?: string;

    // Cache
    cache_ttl_minutes?: number;

    // Rate limits
    global_rate_limit_requests?: number;
    global_rate_limit_seconds?: number;
    new_account_wait_hours?: number;
    daily_upload_limit?: number;
    comment_cooldown_seconds?: number;
    comment_daily_limit?: number;

    // Legal settings
    contact_email?: string;
    terms_updated_at?: string;
    privacy_updated_at?: string;
    cookies_updated_at?: string;
}
