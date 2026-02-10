import { API_URL } from "$env/static/private";
import type { ApiResponse, Playlist, Video } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, fetch }) => {
    const slug = params.slug || "";

    type PlaylistWithVideos = Playlist & { videos: Array<Video & { position: number }> }

    const response = await fetch(`${API_URL}/api/playlists/${slug}`);
    const { data: playlist }: ApiResponse<PlaylistWithVideos> = response.ok
        ? await response.json()
        : {};

    return {
        playlist,
    };
}

