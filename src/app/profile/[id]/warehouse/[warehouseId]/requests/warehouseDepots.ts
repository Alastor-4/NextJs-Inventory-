import apiRequest from "@/api"

const url = (ownerId: string, warehouseId: string) => `/profile/${ownerId}/warehouse/${warehouseId}/api`
const urlCreate = (ownerId: string, warehouseId: string) => `/profile/${ownerId}/warehouse/${warehouseId}/create/api`
const urlDepotAssign = (ownerId: string, warehouseId: string) => `/profile/${ownerId}/warehouse/${warehouseId}/depot-assign/api`

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

    allProductsWithoutDepots: async function (userId: string, warehouseId: string) {
        try {
            const response = await apiRequest.get(urlCreate(userId, warehouseId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    depotStoreDistribution: async function (userId: string, warehouseId: string, depotId: string) {
        try {
            const response = await apiRequest.get(urlDepotAssign(userId, warehouseId), {params: {depotId: depotId}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    createDepot: async function ({userId, productId, warehouseId, insertedById, productTotalUnits}) {
        try {
            return await apiRequest.post(url(userId, warehouseId), {warehouseId, productId, insertedById, productTotalUnits})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    increaseUnitsDepot: async function ({ownerId, warehouseId, depotId, newUnits}) {
        try {
            return await apiRequest.put(url(ownerId, warehouseId), {ownerId, depotId, newUnits})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateUnitsDepot: async function ({ownerId, warehouseId, depotId, productTotalUnits, productTotalRemainingUnits}) {
        try {
            return await apiRequest.patch(url(ownerId, warehouseId), {ownerId, depotId, productTotalUnits, productTotalRemainingUnits})
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