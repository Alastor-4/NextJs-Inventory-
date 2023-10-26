import apiRequest from '@/api'

const url = (userId: string, storeId: string) => `/profile/${userId}/store-details/${storeId}/api`

export const storeDetails = {

    getAllProductsByDepartament: async function (userId: string, storeId: string){
        try {
            const response = await apiRequest.get(url(userId, storeId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }   
        return false     
    },

    update: async function (userId: string, storeId: string, data: string) {
        try {
            const response = await apiRequest.put(url(userId, storeId), data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    }
}

