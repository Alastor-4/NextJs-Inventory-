
import apiRequest from "@/api"

const url = `/inventory/store/api`
const updateUrl = `/inventory/store/update/api`

const stores = {
    allUserStores: async function (userId: number) {
        try {
            const response = await apiRequest.get(url, { params: { userId: userId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    storeDetails: async function (userId: number, storeId: any) {
        try {
            const response = await apiRequest.get(updateUrl, { params: { id: userId, storeId: storeId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function (userId: number, data: any) {
        try {
            return await apiRequest.post(url, data)
        } catch (e) {
            //ToDo: notify error here
        }


        return false
    },

    update: async function (userId: number, data: any) {
        try {
            return await apiRequest.put(url, data)
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (userId: number, storeId: any) {
        try {
            const response = await apiRequest.delete(url, { params: { storeId: storeId } })
            return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default stores;