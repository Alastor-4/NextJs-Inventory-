import apiRequest from "@/api"

const url = "/warehouse/api"
const updateUrl = "/warehouse/update/api"

const warehouses = {
    allWarehouses: async function () {
        try {
            const response = await apiRequest.get(url)
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    warehouseDetails: async function (id) {
        try {
            const response = await apiRequest.get(updateUrl, {params: {warehouseId: id}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function ({name, description, address, ownerId}) {
        try {
            return await apiRequest.post(url, {name, description, address, ownerId})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    update: async function ({id, name, description, address, ownerId}) {
        try {
            return await apiRequest.patch(updateUrl, {warehouseId: id, name, description, address, ownerId: ownerId})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (id) {
        try {
            const response = await apiRequest.delete(url, {params: {warehouseId: id}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default warehouses;