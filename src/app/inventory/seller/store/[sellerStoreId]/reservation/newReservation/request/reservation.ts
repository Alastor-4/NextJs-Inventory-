import apiRequest from "@/api"

const url = (storeId: string) => `/inventory/seller/store/${storeId}/reservation/newReservation/api`

export const reservation = {
    getAllReservations: async (storeId: string) => {
        try {
            const request = await apiRequest.get(url(storeId))

            return request.data
        } catch (e) {
            //Error
        }
        return false
    },
    updateReservation: async (storeId: any, data: any) => {
        try {
            const request = await apiRequest.put(url(storeId), data)
            return request.status

        } catch (e) {
            //Error
        }
        return false
    }
}