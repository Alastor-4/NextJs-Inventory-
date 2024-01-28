import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions";

const url = "/inventory/owner/store-assign/addProductFromWarehouse/api";
const urlSpecificComponent = "/inventory/owner/store-assign/addProductFromWarehouse/api/specificComponent";

const requestWarehouse = {
    getAllWarehousesWithTheirDepots: async function (storeId: number) {
        try {
            const request = await apiRequest.get(url, { params: { storeId: storeId } })

            return request.data

        } catch (e) {
            notifyError("Error obteniendo los datos de los depósitos")
        }

        return false
    },

    getWarehouseWithTheirDepots: async function (storeId: number, warehouseId: number) {
        try {
            const request = await apiRequest.get(urlSpecificComponent, { params: { storeId: storeId, warehouseId: warehouseId } })

            return request.data

        } catch (e) {
            notifyError("Error obteniendo los datos del depósito")
        }

        return false
    },

    addProductsStoreDepots: async function (data: any) {
        try {
            const request = await apiRequest.post(url, data)

            return request.status;
        } catch (e) {
            notifyError("Error creando el depósito")
        }

        return false
    },

    updateDepots: async function (data: any) {
        try {
            const request = await apiRequest.put(url, data)

            return request.status;
        } catch (e) {
            notifyError("Error modificando el depósito")
        }

        return false
    },

    updateStoreDepots: async function (data: any) {
        try {
            const request = await apiRequest.put(urlSpecificComponent, data)

            return request.status;
        } catch (e) {
            notifyError("Error modificando el depósito")
        }

        return false
    }
}

export default requestWarehouse