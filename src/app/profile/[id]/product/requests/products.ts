import apiRequest from "@/api"
import {headers} from "next/headers";

const url = (userId) => `/profile/${userId}/product/api`
const updateUrl = (userId) => `/profile/${userId}/product/update/api`

const products = {
    allUserProducts: async function (userId) {
        try {
            const response = await apiRequest.get(url(userId), {params: {userId: userId}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    productDetails: async function (userId, productId) {
        try {
            const response = await apiRequest.get(updateUrl(userId), {params: {productId: productId}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function (userId, data) {
        try {
            return await apiRequest.post(url(userId), data, {headers: { "Content-Type": "multipart/form-data" }})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    update: async function ({userId, productId, name, description, departmentId, buyPrice}) {
        try {
            return await apiRequest.put(updateUrl(userId), {productId: productId, name, description, departmentId, buyPrice})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (userId, productId) {
        try {
            const response = await apiRequest.delete(url(userId), {params: {productId: productId}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default products;