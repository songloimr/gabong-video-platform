import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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
    age_verification_enabled?: boolean;
    google_analytics_code?: string;
    custom_head_html?: string;
    custom_body_html?: string;
    max_upload_size_mb?: number;
    max_video_duration?: number;
    max_files_per_upload?: number;
    r2_account_id?: string;
    r2_access_key_id?: string;
    r2_bucket?: string;
    ffmpeg_path?: string;
    ffmpeg_max_processes?: number;
    ffmpeg_preset?: string;
    cache_ttl_minutes?: number;
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
