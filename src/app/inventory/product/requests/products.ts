// @ts-nocheck
import apiRequest from "@/api"
import {notifyError} from "@/utils/generalFunctions";

const url = (userId) => `/inventory/product/api`
const updateUrl = (userId) => `/inventory/product/update/api`

const products = {
    allUserProducts: async function (userId, departmentIds) {
        try {
            const response = await apiRequest.get(url(userId), {params: {departmentIds: departmentIds}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    allUserProductDepartments: async function (userId) {
        try {
            const response = await apiRequest.get(url(userId))
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
            return await apiRequest.post(url(userId), data)
        } catch (e) {
            notifyError("Ha ocurrido un error creando el producto")
        }

        return false
    },

    syncImages: async function ({userId, productId, productImages}) {
        try {
            return await apiRequest.patch(url(userId), {productId, productImages})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    update: async function (userId, data) {
        try {
            return await apiRequest.put(url(userId), data)
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