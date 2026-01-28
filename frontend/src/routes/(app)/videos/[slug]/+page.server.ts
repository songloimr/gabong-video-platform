import { PUBLIC_VITE_API_URL } from '$env/static/public';
import type { VideoMarkup, VideoSubtitle } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const baseUrl = `${PUBLIC_VITE_API_URL}/api`
    const baseResponse = {
        markups: [] as VideoMarkup[],
        subtitles: [] as VideoSubtitle[],
        video: null,
        error: null,
    }

    try {
        const videoResponse = await fetch(baseUrl + `/videos/${params.slug}`);

        if (!videoResponse.ok) {
            return {
                ...baseResponse,
                error: videoResponse.status === 404 ? 'Video not found' : 'Failed to load video'
            };
        }
        const { data } = await videoResponse.json();

        const [markupsResponse, subtitlesResponse] = await Promise.all([
            fetch(baseUrl + `/videos/${data.id}/markups`),
            fetch(baseUrl + `/videos/${data.id}/subtitles`),
        ]);

        const [{ data: markups }, { data: subtitles }] = await Promise.all([
            markupsResponse.json() as Promise<{ data: VideoMarkup[] }>,
            subtitlesResponse.json() as Promise<{ data: VideoSubtitle[] }>,
        ]);

        return {
            ...baseResponse,
            video: data,
            markups,
            subtitles,
        };
    } catch (error) {
        console.error('Failed to fetch video:', error);
        return {
            ...baseResponse,
            error: 'Failed to load video'
        };
    }
};
