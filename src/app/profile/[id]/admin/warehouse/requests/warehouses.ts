import apiRequest from "@/api"

const url = (userId: any) => `/profile/${userId}/admin/warehouse/api`
const updateUrl = (userId: any) => `/profile/${userId}/admin/warehouse/update/api`

const warehouses = {
    allWarehouses: async function (userId: any) {
        try {
            const response = await apiRequest.get(url(userId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    warehouseDetails: async function (userId: any, id: any) {
        try {
            const response = await apiRequest.get(updateUrl(userId), { params: { warehouseId: id } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function (userId: any, { name, description, address, ownerId }: { name: string, description: string, address: string, ownerId: any }) {
        try {
            return await apiRequest.post(url(userId), { name, description, address, ownerId })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    update: async function (userId: any, { id, name, description, address, ownerId }: { id: any, name: any, description: any, address: any, ownerId: any }) {
        try {
            return await apiRequest.patch(updateUrl(userId), { warehouseId: id, name, description, address, ownerId: ownerId })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (userId: any, id: any) {
        try {
            const response = await apiRequest.delete(url(userId), { params: { warehouseId: id } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default warehouses;