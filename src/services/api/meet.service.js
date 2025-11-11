import { baseService } from '../base.service';

export const meetService = {
  // Obtener cantidad de meets gratuitos creados hoy
  getFreeMeetsToday: async () => {
    return baseService.get('/meets/free-count-today');
  },

};
