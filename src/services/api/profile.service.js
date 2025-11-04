import { baseService } from '../base.service';

export const profileService = {
  getMyProfile: () => baseService.get('/profile/me'),
  updateProfile: (data) => baseService.put('/profile/me', data),
};