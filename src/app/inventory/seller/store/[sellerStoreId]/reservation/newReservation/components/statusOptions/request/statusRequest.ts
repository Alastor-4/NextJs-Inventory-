import apiRequest from "@/api"


const urlStoreDepots = (storeId: string) => `/inventory/seller/store/${storeId}/reservation/newReservation/components/statusOptions/api/apiStoreDepots`
const url = (storeId: string) => `/inventory/seller/store/${storeId}/reservation/newReservation/components/statusOptions/api`

const statusRequest = {

    updateStoreDepots: async (storeId: string, data: any) => {
        try {
            const request = await apiRequest.put(urlStoreDepots(storeId), data)
            return true

        } catch (e) {
            //Error
        }
        return false
    },
    updateReservation: async (storeId: string, data: any) => {
        try {
            const request = await apiRequest.put(url(storeId), data)
            return true

        } catch (e) {
            //Error
        }
        return false
    },

    postSells: async (storeId: string, data: any) => {
        try {
            const request = await apiRequest.post(url(storeId), data)
            return true

        } catch (e) {
            //Error
        }
        return false
    }
}

export default statusRequest