import apiRequest from "@/api"
const showProductWarehouseUrl = `/inventory/owner/store-assign/showProductApi/apiWarehouse`
const showProductStoreUrl = `/inventory/owner/store-assign/showProductApi/apiStore`

const storeAssign = {
    //Peticiones del component ShowProductStore
    allProductsByDepartmentStore: async function (userId: number, storeId: any) {
        try {
            const response = await apiRequest.get(showProductStoreUrl, { params: { storeId: storeId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateProductStore: async function (userId: number, data: any) {
        try {
            return await apiRequest.put(showProductStoreUrl, data)
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateProductWarehouse: async function (userId: number, data: any) {
        try {
            return await apiRequest.put(showProductWarehouseUrl, data)
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    // Peticiones para el component ShowProductWarehouse
    allProductByDepartmentWarehouse: async function (userId: number, storeId: any, warehouseId: any) {
        try {
            const response = await apiRequest.get(showProductWarehouseUrl, { params: { storeId: storeId, warehouseId: warehouseId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    postProductToStoreDepot: async function (userId: number, data: any) {
        try {
            const response = await apiRequest.post(showProductWarehouseUrl, data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    }
}


export default storeAssign;