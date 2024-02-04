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
    changeTransferStatus: async function (storeId: number, data: { id: number, from_store_accepted: boolean, to_store_accepted: boolean, transfer_cancelled: boolean }) {
        try {
            const result = await apiRequest.put(urlTransfer(storeId), data)

            return result.status
        } catch (e) {
            notifyError("Error al cambiar de estado la trasnferencia")
        }
        return false
    },
    getStoreDepot: async function (storeId: number, productId: number) {
        try {
            const result = await apiRequest.get(urlStoreDepot(storeId), { params: { productId: productId } })

            return result.data
        } catch (e) {
            notifyError("Error al comprobar si el producto existe en la tienda")
        }
        return false
    },
    createInstanceInStore: async function (storeId: number, data: TransferStoreDepots) {
        try {
            const result = await apiRequest.post(urlStoreDepot(storeId), data)

            return result.status
        } catch (e) {
            notifyError("Error al crear una instancia de este producto en la tienda")
        }
        return false
    },
    addNewUnits: async function (storeId: number, data: { id: number, product_remaining_units: number, product_units: number }) {
        try {
            const result = await apiRequest.put(urlStoreDepot(storeId), data)

            return result.status
        } catch (e) {
            notifyError("Error al agregar nuevas unidades")
        }
        return false
    },
    addNewOffers: async function (storeId: number, data: TransferOffers) {
        try {
            const result = await apiRequest.post(urlOfferTransfer(storeId), data)

            return result.status
        } catch (e) {
            notifyError("Error al crear las ofertas")
        }
        return false
    },
    createSells: async function (storeId: number, data: SellsAndSellProductProps) {
        try {
            const result = await apiRequest.post(urlSells(storeId), data)

            return result.status
        } catch (e) {
            notifyError("Error al realizar la venta")
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