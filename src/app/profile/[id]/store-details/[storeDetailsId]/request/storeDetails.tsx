import React from 'react'
import apiRequest from '@/api'

const url = (userId: any, storeId: any) => `/profile/${userId}/store-details/${storeId}/api`

export const storeDetails = {

    getAllProductsByDepartament: async function (userId:any, storeId: any){
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
    }
}

