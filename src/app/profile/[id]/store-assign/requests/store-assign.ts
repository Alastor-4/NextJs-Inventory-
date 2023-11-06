// @ts-nocheck
import apiRequest from "@/api"

const url = (userId) => `/profile/${userId}/store-assign/api1`
const updateUrl = (userId) => `/profile/${userId}/store/update/api`
const showProductWarehouseUrl = (userId) => `/profile/${userId}/store-assign/showProductApi/apiWarehouse`
const showProductStoreUrl = (userId) => `/profile/${userId}/store-assign/showProductApi/apiStore`


const storeAssign = {
    //Peticiones del component ShowProductStore
    allProductsByDepartmentStore: async function (userId, storeId) {
        try {
            const response = await apiRequest.get(showProductStoreUrl(userId), { params: { storeId: storeId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateProductStore: async function (userId, data) {
        try {
            const response = await apiRequest.put(showProductStoreUrl(userId), data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateProductWarehouse: async function (userId, data) {
        try {
            return await apiRequest.put(showProductWarehouseUrl(userId), data)
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    // Peticiones para el component ShowProductWarehouse
    allProductByDepartmentWarehouse: async function (userId, storeId, warehouseId) {
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