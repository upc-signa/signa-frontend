import { baseService } from '../base.service';

export const historyService = {
  // Obtener el historial completo de meets
  getHistory: async () => {
    return baseService.get('/meets/history');
  },

  // Obtener un meet específico con todos sus mensajes
  getMeetById: async (meetId) => {
    return baseService.get(`/meets/${meetId}`);
  },

  // Eliminar un meet individual
  deleteMeet: async (meetId) => {
    return baseService.delete(`/meets/${meetId}`);
  },

  // Eliminar todo el historial
  deleteAllHistory: async () => {
    return baseService.delete('/meets/history');
  },
};
