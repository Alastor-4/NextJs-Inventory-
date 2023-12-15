
import apiRequest from "@/api"

const url = (userId: any) => `/inventory/admin/role/api`;
const updateUrl = (userId: any) => `/inventory/admin/role/update/api`;

const roles = {
    allRoles: async function (userId: any) {
        try {
            const response = await apiRequest.get(url(userId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    roleDetails: async function (userId: any, roleId: any) {
        try {
            const response = await apiRequest.get(updateUrl(userId), { params: { roleId: roleId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function (userId: any, { name, description }: { name: string, description: string }) {
        try {
            return await apiRequest.post(url(userId), { name, description })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    update: async function (userId: any, { id, name, description }: { id: any, name: string, description: string }) {
        try {
            return await apiRequest.put(url(userId), { roleId: id, name, description })
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (userId: any, id: any) {
        try {
            const response = await apiRequest.delete(url(userId), { params: { roleId: id } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default roles;