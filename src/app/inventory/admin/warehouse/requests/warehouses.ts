import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions";

const url = () => `/inventory/admin/warehouse/api`
const updateUrl = () => `/inventory/admin/warehouse/update/api`
const createUrl = () => `/inventory/admin/warehouse/create/api`

const warehouses = {
    allWarehouses: async function () {
        try {
            const response = await apiRequest.get(url())
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    warehouseDetails: async function (id: any) {
        try {
            const response = await apiRequest.get(updateUrl(), { params: { warehouseId: id } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function ({ name, description, address, ownerId }: { name: string, description: string, address: string, ownerId: any }) {
        try {
            return await apiRequest.post(url(), { name, description, address, ownerId })
        } catch (e) {
            notifyError("Ha fallado la creación del almacén")
        }

        return false
    },

    update: async function ({ id, name, description, address, ownerId }: { id: string, name: any, description: any, address: any, ownerId: any }) {
        try {
            return await apiRequest.patch(updateUrl(), { warehouseId: id, name, description, address, ownerId: ownerId })
        } catch (e) {
            notifyError("Ha fallado la modificación del almacén")
        }

        return false
    },

    delete: async function (id: any) {
        try {
            const response = await apiRequest.delete(url(), { params: { warehouseId: id } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    allOwnerUsers: async function () {
        try {
            const response = await apiRequest.get(createUrl())
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default warehouses;