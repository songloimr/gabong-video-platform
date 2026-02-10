import { API_URL } from '$env/static/private';
import type { ApiResponse, SiteSettings } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
    position: 'header_bar' | 'homepage_banner' | 'video_sidebar';
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
}


export const load: LayoutServerLoad = async ({ fetch }) => {

    try {
        const [announcementsResponse, settingsResponse] = await Promise.all([
            fetch(`${API_URL}/api/announcements?position=header_bar`),
            fetch(`${API_URL}/api/site-settings/public`),
        ]);

        const { data: announcements }: ApiResponse<Announcement[]> = announcementsResponse.ok
            ? await announcementsResponse.json()
            : [];
        const { data: siteSettings }: ApiResponse<SiteSettings> = settingsResponse.ok
            ? await settingsResponse.json()
            : {};

        return {
            announcements,
            siteSettings,
        };
    } catch (error) {
        console.error('Layout SSR fetch error:', error);
        return {
            announcements: [] as Announcement[],
            siteSettings: {} as SiteSettings,
        };
    }
};
