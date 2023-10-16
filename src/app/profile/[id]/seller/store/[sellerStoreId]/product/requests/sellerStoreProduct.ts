import apiRequest from "@/api"

const url = (userId, sellerStoreId) => `/profile/${userId}/seller/store/${sellerStoreId}/product/api`

const sellerStoreProduct = {
    toggleIsActiveStoreDepot: async function (userId, sellerStoreId, storeDepotId) {
        try {
            const response = await apiRequest.put(url(userId, sellerStoreId), {storeDepotId})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    sellStoreDepotDefault: async function (userId, sellerStoreId, storeDepotId) {
        try {
            const response = await apiRequest.patch(url(userId, sellerStoreId), {storeDepotId})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

}

export default sellerStoreProduct;