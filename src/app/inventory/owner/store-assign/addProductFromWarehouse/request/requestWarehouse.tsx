import apiRequest from "@/api"

const url = `/inventory/owner/store-assign/addProductFromWarehouse/api`
const urlSpecificComponent = `/inventory/owner/store-assign/addProductFromWarehouse/api/specificComponent`

const requestWarehouse = {

    getAllWarehousesWithTheirDepots: async function (storeId: number) {
        try {
            const request = await apiRequest.get(url, { params: { storeId: storeId } })

            return request.data

        } catch (e) {
            //Error
        }
        return false
    },
    getWarehouseWithTheirDepots: async function (storeId: number, warehouseId: number) {
        try {
            const request = await apiRequest.get(urlSpecificComponent, { params: { storeId: storeId, warehouseId: warehouseId } })

            return request.data

        } catch (e) {
            //Error
        }
        return false
    },

    addProductsStoreDepots: async function (data: any) {

        try {
            const request = await apiRequest.post(url, data)

            return request.status;
        } catch (e) {
            //Error
        }

    },
    updateDepots: async function (data: any) {

        try {
            const request = await apiRequest.put(url, data)

            return request.status;
        } catch (e) {
            //Error
        }

    },
    updateStoreDepots: async function (data: any) {

        try {
            const request = await apiRequest.put(urlSpecificComponent, data)

            return request.status;
        } catch (e) {
            //Error
        }

    }
}

export default requestWarehouse