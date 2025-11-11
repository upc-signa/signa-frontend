import { baseService } from '../base.service';

export const historyService = {
  // Obtener el historial completo de meets
  getHistory: async () => {
    return baseService.get('/meets/history');
  },

  // Eliminar todo el historial
  deleteAllHistory: async () => {
    return baseService.delete('/meets/history');
  },
};
