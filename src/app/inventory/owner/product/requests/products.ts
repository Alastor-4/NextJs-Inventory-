//@ts-nocheck
import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions";

const url = `/inventory/owner/product/api`
const updateUrl = `/inventory/owner/product/update/api`
const urlApiDepartments = `/inventory/owner/product/apiDepartments`
const products = {
    allUserProductDepartments: async function (userId) {
        try {
            const response = await apiRequest.get(url, { params: { userId: userId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    productDetails: async function (productId: number) {
        try {
            const response = await apiRequest.get(updateUrl, { params: { productId: productId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function (data) {
        try {
            return await apiRequest.post(url, data)
        } catch (e) {
            notifyError("Ha ocurrido un error creando el producto")
        }

        return false
    },

    update: async function (data) {
        try {
            return await apiRequest.put(url, data)
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    insertImages: async function ({ productId, productImages }) {
        try {
            return await apiRequest.patch(url, { productId, productImages })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (productId) {
        try {
            const response = await apiRequest.delete(url, { params: { productId: productId } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    approve: async function (productId) {
        try {
            const response = await apiRequest.put(updateUrl, { productId: productId })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    getDepartmentsByUserAndGlobal: async function (usersId: number) {
        try {
            const response = await apiRequest.get(urlApiDepartments, { params: { usersId } });
            return response.data
        } catch (e) {
            notifyError("Error al obtener los departamentos")
        }
        return false
    }
}

export default products;