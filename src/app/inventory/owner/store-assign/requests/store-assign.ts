import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions"

const showProductWarehouseUrl = `/inventory/owner/store-assign/showProductApi/apiWarehouse`
const showProductStoreUrl = `/inventory/owner/store-assign/showProductApi/apiStore`
const transactionUrl = `/inventory/owner/store-assign/showProductApi/apiTransactions`

const storeAssign = {
    //Peticiones del component ShowProductStore
    allProductsByDepartmentStore: async function (storeId: any) {
        try {
            const response = await apiRequest.get(showProductStoreUrl, { params: { storeId: storeId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateProductStore: async function (data: any) {
        try {
            return await apiRequest.put(showProductStoreUrl, data)
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateProductWarehouse: async function (data: any) {
        try {
            return await apiRequest.put(showProductWarehouseUrl, data)
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    // Peticiones para el component ShowProductWarehouse
    allProductByDepartmentWarehouse: async function (storeId: any, warehouseId: any) {
        try {
            const response = await apiRequest.get(showProductWarehouseUrl, { params: { storeId: storeId, warehouseId: warehouseId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    postProductToStoreDepot: async function (data: any) {
        try {
            const response = await apiRequest.post(showProductWarehouseUrl, data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
    createTransaction: async function (data: any) {
        try {
            const response = await apiRequest.post(transactionUrl, data)
            return response.status
        } catch (e) {
            notifyError("Error al registar la transacción")
        }
        return false
    }
}


export default storeAssign;