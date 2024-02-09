import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions";

const url = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/product/api`
const urlSellReceivable = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/product/sellReceivableApi`
const urlProperty = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/product/propertiesApi`

const sellerStoreProduct = {
    allProductByDepartments: async function (sellerStoreId: number) {
        try {
            const response = await apiRequest.get(url(sellerStoreId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error obteniendo los productos. Inténtelo nuevamente")
        }

        return false
    },

    toggleIsActiveStoreDepot: async function (sellerStoreId: number, storeDepotIndex: number) {
        try {
            const response = await apiRequest.put(url(sellerStoreId), { storeDepotId: storeDepotIndex })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error cambiando el estado del producto. Inténtelo nuevamente")
        }

        return false
    },

    sellStoreDepotDefault: async function (sellerStoreId: number, storeDepotIndex: number) {
        try {
            const response = await apiRequest.patch(url(sellerStoreId), { storeDepotId: storeDepotIndex })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error creando la venta del producto. Inténtelo nuevamente")
        }

        return false
    },

    sellStoreDepotManual: async function ({ sellerStoreId, sellData, sellProductsData }: any) {
        try {
            const response = await apiRequest.post(url(sellerStoreId), { sellData, sellProductsData })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error creando la venta de los productos. Inténtelo nuevamente")
        }

        return false
    },

    createSellReceivable: async function ({ sellerStoreId, sellData, sellProductsData }: any) {
        try {
            const response = await apiRequest.post(urlSellReceivable(sellerStoreId), { sellData, sellProductsData })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error creando la venta de los productos. Inténtelo nuevamente")
        }

        return false
    },

    createStoreDepotProperty: async function (sellerStoreId: number, propertyName: string, propertyValue: string) {
        try {
            const response = await apiRequest.post(urlProperty(sellerStoreId), {name: propertyName, value: propertyValue}, { params : {storeDepotId: sellerStoreId} })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error creando la propiedad. Inténtelo nuevamente")
        }

        return false
    },

    toggleActiveStoreDepotProperty: async function (sellerStoreId: number, propertyId: number, isActive: boolean) {
        try {
            const response = await apiRequest.put(urlProperty(sellerStoreId), {isActive: isActive}, { params : {propertyId: propertyId} })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error modificando la propiedad. Inténtelo nuevamente")
        }

        return false
    },
}

export default sellerStoreProduct;