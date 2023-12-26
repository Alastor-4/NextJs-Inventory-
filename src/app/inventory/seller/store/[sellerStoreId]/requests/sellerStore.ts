// @ts-nocheck
import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions";

const url = (sellerStoreId) => `/inventory/seller/store/${sellerStoreId}/api`
const sellsUrl = (sellerStoreId) => `/inventory/seller/store/${sellerStoreId}/sellsApi`

const sellerStore = {
    storeDetails: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.get(url(sellerStoreId), { params: { id: userId, sellerStoreId: sellerStoreId } })
            return response.data
        } catch (e) {
            notifyError(`Ha ocurrido un error obteniendo los datos de la tienda. Inténtelo nuevamente(Posible fallos en userId =${userId} sellerStoreId=${sellerStoreId} )`)
        }

        return false
    },

    storeSellsDetails: async function (sellerStoreId) {
        try {
            const response = await apiRequest.get(sellsUrl(sellerStoreId), { params: { sellerStoreId: sellerStoreId } })
            return response.data
        } catch (e) {
            notifyError(`Ha ocurrido un error obteniendo los datos de las ventas de la tienda. Inténtelo nuevamente(Posible fallos en userId =${userId} sellerStoreId=${sellerStoreId} )`)
        }

        return false
    },

    changeAutoOpenTime: async function (sellerStoreId) {
        try {
            const response = await apiRequest.put(url(sellerStoreId), null, { params: { sellerStoreId: sellerStoreId } })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    changeAutoReservationTime: async function (sellerStoreId) {
        try {
            const response = await apiRequest.patch(url(sellerStoreId), null, { params: { sellerStoreId: sellerStoreId } })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

}

export default sellerStore;