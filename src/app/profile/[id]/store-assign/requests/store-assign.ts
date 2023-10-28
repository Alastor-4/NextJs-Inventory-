// @ts-nocheck
import apiRequest from "@/api"

const url = (userId) => `/profile/${userId}/store-assign/api1`
const updateUrl = (userId) => `/profile/${userId}/store/update/api`
const showProductWarehouseUrl = (userId) => `/profile/${userId}/store-assign/showProductApi/apiWarehouse`
const showProductStoreUrl = (userId) => `/profile/${userId}/store-assign/showProductApi/apiStore`


const storeAssign = {
    //Periciones del component ShowPoductStore
    allProductsbyDepartmentStore: async function (userId, storeId) {
        try {
            const response = await apiRequest.get(showProductStoreUrl(userId), { params: { storeId: storeId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    UpdateProductStore: async function (userId, data) {
        try {
            const response = await apiRequest.put(showProductStoreUrl(userId), data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    UpdateProductWarehouse: async function (userId, data) {
        try {
            const response = await apiRequest.put(showProductWarehouseUrl(userId), data)
            return response
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    RemoveProductStore: async function (userId, storeDepotId) {
        try {
            const response = await apiRequest.delete(showProductStoreUrl(userId), { params: { storeDepotId: storeDepotId } })
            return response
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    // Peticiones para el component ShowProductWarehouse
    allProductbyDepartmentWarehouse: async function (userId, storeId, warehouseId) {
        try {
            const response = await apiRequest.get(showProductWarehouseUrl(userId), { params: { storeId: storeId, warehouseId: warehouseId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    postProductToStoreDepot: async function (userId, data) {
        try {
            const response = await apiRequest.post(showProductWarehouseUrl(userId), data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    }
}


export default storeAssign;