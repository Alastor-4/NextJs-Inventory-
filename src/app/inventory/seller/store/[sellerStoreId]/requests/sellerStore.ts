import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import apiRequest from "@/api";
import dayjs from "dayjs";

const url = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/api`;
const sellsUrl = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/sellsApi`;
const transferUrl = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/transferApi`;
const sellsReceivableUrl = (sellerStoreId: number) => `/inventory/seller/store/${sellerStoreId}/sellsReceivableApi`;


let dateStart = dayjs().set("h", 0).set("m", 0).set("s", 0);
const todayStart = dateStart.format();
let todayEnd = dateStart.add(24, "hours").format();

const sellerStore = {
    storeDetails: async function (userId: number, sellerStoreId: number) {
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
            const response = await apiRequest.get(sellsUrl(sellerStoreId), { params: { storeId: sellerStoreId, loadAllSells: allSells, todayStart: todayStart, todayEnd: todayEnd } });
            return response.data;
        } catch (e) {
            notifyError(`Ha ocurrido un error obteniendo los datos de las ventas de la tienda. Inténtelo nuevamente`)
        }
        return false
    },

    changeAutoOpenTime: async function (sellerStoreId: number) {
        try {
            const response = await apiRequest.put(url(sellerStoreId), null)
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    changeAutoReservationTime: async function (sellerStoreId: number) {
        try {
            const response = await apiRequest.patch(url(sellerStoreId), null)
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al cambiar el estado de la tienda. Inténtelo nuevamente")
        }

        return false
    },

    getTodayTransfersStats: async function (sellerStoreId: number) {
        try {
            const response = await apiRequest.get(transferUrl(sellerStoreId), { params: { todayStart: todayStart, todayEnd: todayEnd } })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al obtener los detalles de las transferencia. Inténtelo nuevamente")
        }

        return false
    },

    getTodayTransfersDetails: async function (sellerStoreId: number) {
        try {
            const response = await apiRequest.post(transferUrl(sellerStoreId), null, { params: { todayStart: todayStart, todayEnd: todayEnd } })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error al obtener los detalles de la transferencias. Inténtelo nuevamente")
        }

        return false
    },

    getSellsReceivable: async function (sellerStoreId: number) {
        try {
            const response = await apiRequest.get(sellsReceivableUrl(sellerStoreId), { params: { storeId: sellerStoreId, todayStart: todayStart, todayEnd: todayEnd } });
            return response.data;
        } catch (e) {
            notifyError("Ha ocurrido un error al obtener los detalles de las ventas por cobrar. Inténtelo nuevamente");
        }
        return false;
    },

    payOrCancelSellReceivable: async function (sellId: number, action: string) {
        try {
            const response = await apiRequest.patch(sellsReceivableUrl(sellId), { sellId, action });
            notifySuccess(response.data);
            return response.data;
        } catch (error) {
            notifyError("Ha ocurrido un error procesando la venta por pagar");
        }
    },

    addReturnToSellProducts: async function (sellerStoreId: number, sellProductsId: number, returnedQuantity: number, returnedReason: string) {
        try {
            const response = await apiRequest.put(sellsUrl(sellerStoreId), { sell_product_id: sellProductsId, returned_quantity: returnedQuantity, returned_reason: returnedReason });
            return response.status
        } catch (e) {
            notifyError("Ha ocurrido un error añadiendo una devolución");
        }
        return false
    },

}

export default sellerStore;