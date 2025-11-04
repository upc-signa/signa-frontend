import { baseService } from '../base.service';

export const planService = {
  getCurrentPlan: () => baseService.get('/profile/me/plan'),
  upgradeToPremium: () => baseService.put('/profile/me/plan/upgrade'),
};