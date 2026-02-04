import { PUBLIC_VITE_API_URL } from '$env/static/public';
import type { ApiResponse, Video, VideoMarkup, VideoSubtitle } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const baseUrl = `${PUBLIC_VITE_API_URL}/api`
    const baseResponse: {
        markups: VideoMarkup[],
        subtitles: VideoSubtitle[],
        video?: Video,
        error?: string,
    } = {
        markups: [],
        subtitles: []
    }

    try {
        const videoResponse = await fetch(baseUrl + `/videos/${params.slug}`);

        if (!videoResponse.ok) {
            return {
                ...baseResponse,
                error: videoResponse.status === 404 ? 'errors.notFound' : 'errors.loadFailed'
            };
        }
        const { data: video }: ApiResponse<Video> = await videoResponse.json();

        const [markupsResponse, subtitlesResponse] = await Promise.all([
            fetch(baseUrl + `/videos/${video.id}/markups`),
            fetch(baseUrl + `/videos/${video.id}/subtitles`),
        ]);

        const [{ data: markups }, { data: subtitles }] = await Promise.all([
            markupsResponse.json() as Promise<ApiResponse<VideoMarkup[]>>,
            subtitlesResponse.json() as Promise<ApiResponse<VideoSubtitle[]>>,
        ]);

        return {
            ...baseResponse,
            video,
            markups,
            subtitles,
        };
    } catch (error) {
        console.error('Failed to fetch video:', error);
        return {
            ...baseResponse,
            error: 'errors.loadFailed'
        };
    }
};
