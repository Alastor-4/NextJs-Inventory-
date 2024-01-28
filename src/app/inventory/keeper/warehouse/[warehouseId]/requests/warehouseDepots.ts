import apiRequest from "@/api";

const url = (warehouseId: number) => `/inventory/keeper/warehouse/${warehouseId}/api`;
const urlCreate = (warehouseId: number) => `/inventory/keeper/warehouse/${warehouseId}/create/api`;
const urlDepotAssign = (warehouseId: number) => `/inventory/keeper/warehouse/${warehouseId}/depot-assign/api`;

const warehouseDepots = {
    allDepots: async function (ownerId?: number, warehouseId?: number) {
        try {
            const response = await apiRequest.get(url(warehouseId!), { params: { ownerId: ownerId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    allProductsWithoutDepots: async function (userId?: number, warehouseId?: number) {
        try {
            const response = await apiRequest.get(urlCreate(warehouseId!), { params: { userId: userId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    depotStoreDistribution: async function (userId: number, warehouseId: number, depotId: number) {
        try {
            const response = await apiRequest.get(urlDepotAssign(warehouseId), { params: { userId: userId, depotId: depotId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    createDepot: async function ({ userId, productId, warehouseId, insertedById, productTotalUnits }: any) {
        try {
            return await apiRequest.post(url(warehouseId), { warehouseId, productId, insertedById, productTotalUnits })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    increaseUnitsDepot: async function ({ ownerId, warehouseId, depotId, newUnits }: any) {
        try {
            return await apiRequest.put(url(warehouseId), { ownerId, depotId, newUnits })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    updateUnitsDepot: async function ({ ownerId, warehouseId, depotId, productTotalUnits, productTotalRemainingUnits }: any) {
        try {
            return await apiRequest.patch(url(warehouseId), { ownerId, depotId, productTotalUnits, productTotalRemainingUnits })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    sendDepotFromWarehouseToStore: async function ({ userId, warehouseId, depotId, storeDepotId, storeId, moveUnitQuantity }: any) {
        try {
            const response = await apiRequest.put(urlDepotAssign(warehouseId), { ownerId: userId, depotId, storeDepotId, storeId, moveUnitQuantity })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    sendDepotFromStoreToWarehouse: async function ({ userId, warehouseId, depotId, storeDepotId, moveUnitQuantity }: any) {
        try {
            const response = await apiRequest.patch(urlDepotAssign(warehouseId), { ownerId: userId, depotId, storeDepotId, moveUnitQuantity })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    deleteDepot: async function (userId?: number, warehouseId?: number, depotId?: number) {
        try {
            const response = await apiRequest.delete(url(warehouseId!), { params: { depotId: depotId } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default warehouseDepots;