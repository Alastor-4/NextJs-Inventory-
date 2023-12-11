import apiRequest from "@/api"

const url = (userId: string, storeId: string) => `/inventory/seller/store/${storeId}/reservation/newReservation/api`

export const reservation = {
    getAllReservations: async (userId: string, storeId: string) => {
        try {
            const request = await apiRequest.get(url(userId, storeId))

            return request.data
        } catch (e) {
            //Error
        }
        return false
    },
    updateReservation: async (userId: any, storeId: any, data: any) => {
        try {
            const request = await apiRequest.put(url(userId, storeId), data)
            return request.status

        } catch (e) {
            //Error
        }
        return false
    }
}