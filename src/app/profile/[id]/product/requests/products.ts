import apiRequest from "@/api"

const url = (userId) => `/profile/${userId}/api`
const updateUrl = (userId) => `/profile/${userId}/update/api`

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

    create: async function ({userId, name, description, departmentId, buyPrice}) {
        try {
            return await apiRequest.post(url(userId), {userId, name, description, departmentId, buyPrice})
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