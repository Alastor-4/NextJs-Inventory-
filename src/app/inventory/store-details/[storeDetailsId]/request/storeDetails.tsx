import React from 'react'
import apiRequest from '@/api'

const url = (storeId: any) => `/inventory/store-details/${storeId}/api`
const urlTranferUnits = (storeId: any) => `/inventory/store-details/${storeId}/apiTransferUnits`
const urlOffers = (storeId: any) => `/inventory/store-details/${storeId}/components/offers/api`


export const storeDetails = {

    getAllProductsByDepartament: async function (userId: any, storeId: any) {
        try {
            const response = await apiRequest.get(url(storeId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },


    update: async function (userId: any, storeId: any, data: Object) {
        try {
            const response = await apiRequest.put(url(storeId), data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
    //Requests transferUnits
    getDataWharehouse_Depots: async function (userId: any, storeId: any, productId: any) {
        try {
            const response = await apiRequest.get(urlTranferUnits(storeId), { params: { productId: productId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    updateDepotsAndStoreDepots: async function (userId: any, storeId: any, data: Object) {
        try {
            const response = await apiRequest.put(urlTranferUnits(storeId), data)
            return response.status;
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    //productOffers
    getProductOffers: async function (userId: any, storeId: any, storeDepotId: any) {
        try {
            const response = await apiRequest.get(urlOffers(storeId), { params: { storeDepotId: storeDepotId } })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    createProductOffers: async function (userId: any, storeId: any, data: any) {
        try {
            const response = await apiRequest.post(urlOffers(storeId), data)

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },
    updateProductOffers: async function (userId: any, storeId: any, data: any) {
        try {
            const response = await apiRequest.put(urlOffers(storeId), data)

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },
    toggleProductOffers: async function (userId: any, storeId: any, productOfferId: any) {
        try {
            const response = await apiRequest.patch(urlOffers(storeId), { productOfferId: productOfferId })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },
    removeProductOffers: async function (userId: any, storeId: any, productOfferId: any) {
        try {
            const response = await apiRequest.delete(urlOffers(storeId), { params: { productOfferId: productOfferId } })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    }

}
