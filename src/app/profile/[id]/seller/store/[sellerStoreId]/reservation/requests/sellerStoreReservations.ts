// @ts-nocheck
import apiRequest from "@/api"

const url = (userId, sellerStoreId) => `/profile/${userId}/seller/store/${sellerStoreId}/reservation/api`

const sellerStoreReservations = {
    setReservedStatus: async function (userId, sellerStoreId, storeDepotId, productReservationId) {
        try {
            const response = await apiRequest.put(url(userId, sellerStoreId), {storeDepotId, productReservationId})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    setCanceledStatus: async function (userId, sellerStoreId, productReservationId) {
        try {
            const response = await apiRequest.patch(url(userId, sellerStoreId), {productReservationId})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    setStartingDeliveryStatus: async function (userId, sellerStoreId, productReservationId) {
        try {
            const response = await apiRequest.post(url(userId, sellerStoreId), {productReservationId})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

}

export default sellerStoreReservations;