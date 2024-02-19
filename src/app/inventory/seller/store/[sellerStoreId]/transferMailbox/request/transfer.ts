import apiRequest from "@/api";
import { notifyError } from "@/utils/generalFunctions";


interface TransferStoreDepots {
    id?: number
    store_id: number
    depot_id: number
    product_remaining_units: number
    product_units: number
    seller_profit_percentage: number | null
    is_active: boolean
    sell_price: string
    sell_price_unit: string,
    seller_profit_quantity: number | null
    price_discount_percentage: number | null
    price_discount_quantity: number | null
    seller_profit_unit: number | null
}

interface TransferOffers {
    product_offers: {
        compare_units_quantity: number
        compare_function: string
        price_per_unit: number
        store_depot_id: number
        is_active: boolean
    }[]
}

interface SellsAndSellProductProps {
    total_price: number
    payment_method: string,
    store_depot_id: number,
    units_quantity: number,
    price: number
}


const urlTransfer = (storeId: number) => `/inventory/seller/store/${storeId}/transferMailbox/api/apiReceived/apiProductTransfer`

const urlStoreDepot = (storeId: number) => `/inventory/seller/store/${storeId}/transferMailbox/api/apiReceived/apiStoreDepots`

const urlOfferTransfer = (storeId: number) => `/inventory/seller/store/${storeId}/transferMailbox/api/apiReceived/apiOffersTransfer`

const urlSells = (storeId: number) => `/inventory/seller/store/${storeId}/transferMailbox/api/apiReceived/apiSell`

const urlSent = (storeId: number) => `/inventory/seller/store/${storeId}/transferMailbox/api/apiSent`

const urlUser = (storeId: number) => `/inventory/seller/store/${storeId}/transferMailbox/api/apiUser`

const urlStore = (storeId: number) => `/inventory/seller/store/${storeId}/transferMailbox/api/apiStore`


export const transfer = {
    getAllTransfersReceived: async function (storeId: number) {
        try {
            const result = await apiRequest.get(urlTransfer(storeId))

            return result.data
        } catch (e) {
            notifyError("Error al obtener los datos de la transferencia")
        }
        return false
    },

    getStoreDepot: async function (storeId: number, productId: number) {
        try {
            const result = await apiRequest.get(urlStoreDepot(storeId), { params: { productId: productId } })

            return result.data
        } catch (e) {
            notifyError("Error comprobando el producto")
        }
        return false
    },

    handleAcceptTransfer: async function (storeId: number, productStoreTransferId: number) {
        try {
            const result = await apiRequest.post(urlTransfer(storeId), {productStoreTransferId: productStoreTransferId})

            return result.data
        } catch (e) {
            notifyError("Ha ocurrido un error al aceptar la transferencia")
        }
        return false
    },

    handleAcceptTransferAndSell: async function (storeId: number, productStoreTransferId: number, sellUnitsQuantity: number, paymentMethod: string) {
        try {
            const result = await apiRequest.patch(urlTransfer(storeId), {productStoreTransferId, sellUnitsQuantity, paymentMethod})

            return result.data
        } catch (e) {
            notifyError("Ha ocurrido un error al aceptar la transferencia")
        }
        return false
    },

    handleCancelTransfer: async function (storeId: number, productStoreTransferId: number) {
        try {
            const result = await apiRequest.put(urlTransfer(storeId), {productStoreTransferId})

            return result.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cancelar la transferencia")
        }
        return false
    },

    //Sent
    getAllTransfersSent: async function (storeId: number) {
        try {
            const result = await apiRequest.get(urlSent(storeId))

            return result.data
        } catch (e) {
            notifyError("Error al cargar las transferencias")
        }
        return false
    },

    //get Data Filter
    getDataUser: async function (storeId: number, userId: number) {
        try {
            const result = await apiRequest.get(urlUser(storeId), { params: { userId: userId } })

            return result.data
        } catch (e) {
            notifyError("Error al obtener datos para filtrar(datos de usuario)")
        }
        return false
    },

    getAllOwnerStores: async function (storeId: number, userId: number) {
        try {
            const result = await apiRequest.get(urlStore(storeId), { params: { userId: userId } })

            return result.data
        } catch (e) {
            notifyError("Error al obtener datos para filtrar(tiendas)")
        }
        return false
    },
}

export default transfer;