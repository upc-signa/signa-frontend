import { baseService } from '../base.service';

export const meetService = {
    getMeetbyUuid: async (uuid) => {
        return baseService.get('/meets/uuid/' + uuid);
    },
    createNewMeet: async (data) => {
        return baseService.post('/meets', data);
    },
    getFreeMeetsToday: async () => {
        return baseService.get('/meets/free-count-today');
    },
};