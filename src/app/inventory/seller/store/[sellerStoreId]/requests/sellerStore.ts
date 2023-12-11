// @ts-nocheck
import apiRequest from "@/api"
import {notifyError} from "@/utils/generalFunctions";

const url = (userId, sellerStoreId) => `/profile/${userId}/seller/store/${sellerStoreId}/api`
const sellsUrl = (userId, sellerStoreId) => `/profile/${userId}/seller/store/${sellerStoreId}/sellsApi`

const sellerStore = {
    storeDetails: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.get(url(userId, sellerStoreId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error obteniendo los datos de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    storeSellsDetails: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.get(sellsUrl(userId, sellerStoreId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error obteniendo los datos de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    changeAutoOpenTime: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.put(url(userId, sellerStoreId), null, {params: {storeId: sellerStoreId}})
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    changeAutoReservationTime: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.patch(url(userId, sellerStoreId), null, {params: {storeId: sellerStoreId}})
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

}

export default sellerStore;