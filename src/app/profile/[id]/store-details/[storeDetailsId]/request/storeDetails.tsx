import React from 'react'
import apiRequest from '@/api'

const url = (userId: any, storeId: any) => `/profile/${userId}/store-details/${storeId}/api`
const urlTranferUnits = (userId: any, storeId: any) => `/profile/${userId}/store-details/${storeId}/apiTransferUnits`
const urlOffers = (userId: any, storeId: any) => `/profile/${userId}/store-details/${storeId}/components/offers/api`


export const storeDetails = {

    getAllProductsByDepartament: async function (userId: any, storeId: any) {
        try {
            const response = await apiRequest.get(url(userId, storeId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },


    update: async function (userId: any, storeId: any, data: Object) {
        try {
            const response = await apiRequest.put(url(userId, storeId), data)
            return response.status
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
    //Requests transferUnits
    getDataWharehouse_Depots: async function (userId: any, storeId: any, productId: any) {
        try {
            const response = await apiRequest.get(urlTranferUnits(userId, storeId), { params: { productId: productId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    updateDepotsAndStoreDepots: async function (userId: any, storeId: any, data: Object) {
        try {
            const response = await apiRequest.put(urlTranferUnits(userId, storeId), data)
            return response.status;
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    //productOffers
    getProductOffers: async function (userId: any, storeId: any, storeDepotId: any) {
        try {
            const response = await apiRequest.get(urlOffers(userId, storeId), { params: { storeDepotId: storeDepotId } })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    createProductOffers: async function (userId: any, storeId: any, data: any) {
        try {
            const response = await apiRequest.post(urlOffers(userId, storeId), data)

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },
    updateProductOffers: async function (userId: any, storeId: any, data: any) {
        try {
            const response = await apiRequest.put(urlOffers(userId, storeId), data)

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },
    removeProductOffers: async function (userId: any, storeId: any, productOfferId: any) {
        try {
            const response = await apiRequest.delete(urlOffers(userId, storeId), { params: { productOfferId: productOfferId } })

            return response.data
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    }

}
