import apiRequest from "@/api"

const url = (userId, sellerStoreId) => `/profile/${userId}/seller/store/${sellerStoreId}/api`
const updateUrl = (userId) => `/profile/${userId}/store/update/api`

const sellerStore = {
    storeDetails: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.get(url(userId, sellerStoreId), {params: {storeId: sellerStoreId}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    changeAutoOpenTime: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.put(url(userId, sellerStoreId), null, {params: {storeId: sellerStoreId}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

}

export default sellerStore;