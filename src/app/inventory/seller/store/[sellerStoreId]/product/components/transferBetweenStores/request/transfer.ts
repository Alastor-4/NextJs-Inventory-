import apiRequest from "@/api";
import { notifyError } from "@/utils/generalFunctions";

const url = (storeId: string) => `/inventory/seller/store/${storeId}/product/components/transferBetweenStores/api`

export const transfer = {
    getAllStores: async function (storeId: string) {
        try {
            const request = await apiRequest.get(url(storeId))

            return request.data
        } catch (e) {
            notifyError("Error al obtener el listado de tiendas")
        }
        return false
    },

    updateStore: async function (storeId: string, data: any) {
        try {
            const request = await apiRequest.put(url(storeId), data)

            return request.status
        } catch (e) {
            notifyError("Error al restar unidades de la tienda")
        }
        return false
    },

    createTransfer: async function (storeId: string, data: any) {
        try {
            const request = await apiRequest.post(url(storeId), data)

            return request.status
        } catch (e) {
            notifyError("Error al crear la transferencia")
        }
        return false
    },
}