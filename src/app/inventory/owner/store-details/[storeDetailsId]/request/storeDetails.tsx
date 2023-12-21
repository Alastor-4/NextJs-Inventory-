import apiRequest from '@/api';

const url = (storeId: any) => `/inventory/owner/store-details/${storeId}/api`
const urlTransferUnits = (storeId: any) => `/inventory/owner/store-details/${storeId}/apiTransferUnits`
const urlOffers = (storeId: any) => `/inventory/owner/store-details/${storeId}/components/offers/api`


export const storeDetails = {
    getAllProductsByDepartment: async function (storeId: any) {
        try {
            const response = await apiRequest.get(url(storeId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },


    update: async function (storeId: any, data: Object) {
        try {
            const response = await apiRequest.put(url(storeId), data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    //Requests transferUnits
    getDataWarehouseDepots: async function (storeId: any, productId: any) {
        try {
            const response = await apiRequest.get(urlTransferUnits(storeId), { params: { productId: productId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    updateDepotsAndStoreDepots: async function (storeId: any, data: Object) {
        try {
            const response = await apiRequest.put(urlTransferUnits(storeId), data)
            return response.status;
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    //productOffers
    getProductOffers: async function (storeId: any, storeDepotId: any) {
        try {
            const response = await apiRequest.get(urlOffers(storeId), { params: { storeDepotId: storeDepotId } })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    createProductOffers: async function (storeId: any, data: any) {
        try {
            const response = await apiRequest.post(urlOffers(storeId), data)

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    updateProductOffers: async function (storeId: any, data: any) {
        try {
            const response = await apiRequest.put(urlOffers(storeId), data)

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    toggleProductOffers: async function (storeId: any, productOfferId: any) {
        try {
            const response = await apiRequest.patch(urlOffers(storeId), { productOfferId: productOfferId })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    removeProductOffers: async function (storeId: any, productOfferId: any) {
        try {
            const response = await apiRequest.delete(urlOffers(storeId), { params: { productOfferId: productOfferId } })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    }

}
