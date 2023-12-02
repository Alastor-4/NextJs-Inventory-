// @ts-nocheck
import apiRequest from "@/api"
import {notifyError} from "@/utils/generalFunctions";

const url = (userId, sellerStoreId) => `/profile/${userId}/seller/store/${sellerStoreId}/product/api`

const sellerStoreProduct = {
    allProductByDepartments: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.get(url(userId, sellerStoreId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error obteniendo los productos. Inténtelo nuevamente")
        }

        return false
    },

    toggleIsActiveStoreDepot: async function (userId, sellerStoreId, storeDepotId) {
        try {
            const response = await apiRequest.put(url(userId, sellerStoreId), {storeDepotId})
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error cambiando el estado del producto. Inténtelo nuevamente")
        }

        return false
    },

    sellStoreDepotDefault: async function (userId, sellerStoreId, storeDepotId) {
        try {
            const response = await apiRequest.patch(url(userId, sellerStoreId), {storeDepotId})
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error creando la venta del producto. Inténtelo nuevamente")
        }

        return false
    },

    sellStoreDepotManual: async function ({userId, sellerStoreId, sellData, sellProductsData}) {
        try {
            const response = await apiRequest.post(url(userId, sellerStoreId), {sellData, sellProductsData})
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error creando la venta de los productos. Inténtelo nuevamente")
        }

        return false
    },

}

export default sellerStoreProduct;