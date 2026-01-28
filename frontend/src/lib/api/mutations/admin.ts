import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import { videoKeys } from '../queries/videos';

export function useApproveVideo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (videoId: string) => {
      const { data } = await api.post(`/api/admin/videos/${videoId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  }));
}

export function useRejectVideo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ videoId, reason }: { videoId: string; reason: string }) => {
      const { data } = await api.post(`/api/admin/videos/${videoId}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  }));
}

export function useUpdateVideoVisibility() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ videoId, status }: { videoId: string; status: 'approved' | 'hidden' }) => {
      const { data } = await api.put(`/api/admin/videos/${videoId}/visibility`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  }));
}

export function useUpdateVideoUploadDate() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ videoId, customUploadDate }: { videoId: string; customUploadDate: string }) => {
      const { data } = await api.put(`/api/admin/videos/${videoId}/upload-date`, { custom_upload_date: customUploadDate });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  }));
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ userId, status, reason }: { userId: string; status: 'active' | 'suspended' | 'banned'; reason?: string }) => {
      const { data } = await api.put(`/api/admin/users/${userId}/status`, { status, reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  }));
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (videoId: string) => {
      await api.delete(`/api/videos/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  }));
}

export function useRefreshStats() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async () => {
      await api.post('/api/admin/refresh-stats');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  }));
}

export function useUpdateVideoDetails() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ videoId, title, description, category_id }: { videoId: string; title?: string; description?: string; category_id?: string }) => {
      const payload: Record<string, string | undefined> = {};
      if (title !== undefined) payload.title = title;
      if (description !== undefined) payload.description = description;
      if (category_id !== undefined) payload.category_id = category_id;
      const { data } = await api.put(`/api/videos/${videoId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  }));
}

export function useSendMassNotification() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({
      title,
      message,
      link,
      target_user_ids
    }: {
      title: string;
      message: string;
      link?: string;
      target_user_ids?: string[]
    }) => {
      const { data } = await api.post('/api/admin/notifications/mass', {
        title,
        message,
        link,
        target_user_ids,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  }));
}

export function usePinVideo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (videoId: string) => {
      const { data } = await api.patch(`/api/videos/${videoId}/pin`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  }));
}

export function useUnpinVideo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (videoId: string) => {
      const { data } = await api.patch(`/api/videos/${videoId}/unpin`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
      queryClient.invalidateQueries({ queryKey: ['featured'] });
    },
  }));
}
