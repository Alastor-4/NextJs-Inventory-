import apiRequest from "@/api"

const url = (ownerId: string, warehouseId: string) => `/profile/${ownerId}/warehouse/${warehouseId}/api`
const urlCreate = (userId) => `/profile/${userId}/worker/create/api`

const warehouseDepots = {
    allDepots: async function (userId: string, warehouseId: string) {
        try {
            const response = await apiRequest.get(url(userId, warehouseId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    createDepot: async function ({userId, productId, warehouseId, insertedById, productTotalUnits}) {
        try {
            return await apiRequest.put(url(userId, warehouseId), {warehouseId, productId, insertedById, productTotalUnits})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    deleteDepot: async function (userId: string, warehouseId: string, depotId: string) {
        try {
            const response = await apiRequest.delete(url(userId, warehouseId), {params: {depotId: depotId}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default warehouseDepots;