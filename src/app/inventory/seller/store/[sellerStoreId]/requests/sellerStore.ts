//@ts-nocheck
import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions";

const url = (sellerStoreId) => `/inventory/seller/store/${sellerStoreId}/api`
const sellsUrl = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/sellsApi`
const transferUrl = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/transferApi`
const saleReceivableUrl = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/saleReceivableApi`

const sellerStore = {
    storeDetails: async function (userId, sellerStoreId) {
        try {
            const response = await apiRequest.get(url(sellerStoreId), { params: { id: userId } })
            return response.data
        } catch (e) {
            notifyError(`Ha ocurrido un error obteniendo los datos de la tienda. Inténtelo nuevamente`)
        }

        return false
    },

    storeSellsDetails: async function (sellerStoreId: number, allSells?: boolean) {
        try {
            const response = await apiRequest.get(sellsUrl(sellerStoreId), { params: { storeId: sellerStoreId, loadAllSells: allSells } });
            return response.data;
        } catch (e) {
            notifyError(`Ha ocurrido un error obteniendo los datos de las ventas de la tienda. Inténtelo nuevamente`)
        }
        return false
    },

    changeAutoOpenTime: async function (sellerStoreId) {
        try {
            const response = await apiRequest.put(url(sellerStoreId), null)
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    changeAutoReservationTime: async function (sellerStoreId) {
        try {
            const response = await apiRequest.patch(url(sellerStoreId), null)
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    getTodayTransfersStats: async function (sellerStoreId) {
        try {
            const response = await apiRequest.get(transferUrl(sellerStoreId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al obtener los detalles de las transferencia. Inténtelo nuevamente")
        }

        return false
    },

    getTodayTransfersDetails: async function (sellerStoreId) {
        try {
            const response = await apiRequest.post(transferUrl(sellerStoreId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al obtener los detalles de la transferencias. Inténtelo nuevamente")
        }

        return false
    },

    getTodaySalesReceivable: async function (sellerStoreId) {
        try {
            const response = await apiRequest.get(saleReceivableUrl(sellerStoreId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al obtener los detalles de las ventas. Inténtelo nuevamente")
        }

        return false
    },

    addReturnToSellProducts: async function (sellerStoreId: number, sellProductsId: number, returnedQuantity: number, returnedReason: string, returnedAt: string) {
        try {
            const response = await apiRequest.put(sellsUrl(sellerStoreId), { sell_product_id: sellProductsId, returned_quantity: returnedQuantity, returned_reason: returnedReason, returned_at: returnedAt });
            return response.status
        } catch (e) {
            notifyError("Ha ocurrido un añadiendo una devolución")
        }
        return false
    }
}

export default sellerStore;