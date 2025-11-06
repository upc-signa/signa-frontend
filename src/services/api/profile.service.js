import { baseService } from '../base.service';
import { env } from '../../config/env';

export const profileService = {
  getMyProfile: () => baseService.get('/profile/me'),
  updateProfile: (data) => baseService.put('/profile/me', data),

  uploadPicture: (file) => {
    const form = new FormData();
    form.append('file', file);
    return baseService.post('/profile/me/picture', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePicture: () => baseService.delete('/profile/me/picture'),

  pictureUrl: (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const baseUrl = env.API_URL.replace(/\/api\/v1$/, '');
    return `${baseUrl}${path}`;
  },
};