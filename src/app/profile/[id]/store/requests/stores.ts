import apiRequest from "@/api"

const url = (userId) => `/profile/${userId}/store/api`
const updateUrl = (userId) => `/profile/${userId}/store/update/api`

const stores = {
    allUserStores: async function (userId) {
        try {
            const response = await apiRequest.get(url(userId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    storeDetails: async function (userId, storeId) {
        try {
            const response = await apiRequest.get(updateUrl(userId), {params: {storeId: storeId}})
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

    delete: async function (userId, storeId) {
        try {
            const response = await apiRequest.delete(url(userId), {params: {storeId: storeId}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default stores;