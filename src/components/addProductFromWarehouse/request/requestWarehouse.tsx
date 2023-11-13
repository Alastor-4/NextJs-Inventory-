import apiRequest from "@/api"

const url = (userId: any) => `/profile/${userId}/store-assign/addProductFromWarehouse/api`
const urlSpecificComponent = (userId: any) => `/profile/${userId}/store-assign/addProductFromWarehouse/api/specificComponent`

const requestWarehouse = {

    getAllWarehousesWithTheirDepots: async function (userId: any, storeId: any) {
        try {
            const request = await apiRequest.get(url(userId), { params: { storeId: storeId } })

            return request.data

        } catch (e) {
            //Error
        }
        return false
    },
    getWarehouseWithTheirDepots: async function (userId: any, storeId: any, warehouseId: any) {
        try {
            const request = await apiRequest.get(urlSpecificComponent(userId), { params: { storeId: storeId, warehouseId: warehouseId } })

            return request.data

        } catch (e) {
            //Error
        }
        return false
    },

    addProductsStoreDepots: async function (userId: any, data: any) {

        try {
            const request = await apiRequest.post(url(userId), data)

            return request.status;
        } catch (e) {
            //Error
        }

    },
    updateDepots: async function (userId: any, data: any) {

        try {
            const request = await apiRequest.put(url(userId), data)

            return request.status;
        } catch (e) {
            //Error
        }

    },
    updateStoreDepots: async function (userId: any, data: any) {

        try {
            const request = await apiRequest.put(urlSpecificComponent(userId), data)

            return request.status;
        } catch (e) {
            //Error
        }

    }
}

export default requestWarehouse