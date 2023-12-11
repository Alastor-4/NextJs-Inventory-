import apiRequest from "@/api"

const url = (userId: any) => `/inventory/admin/user/api`
const updateUrl = (userId: any) => `/inventory/admin/user/update/api`

const roles = {
    allUsers: async function (userId: any) {
        try {
            const response = await apiRequest.get(url(userId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    userDetails: async function (userId: any, id: any) {
        try {
            const response = await apiRequest.get(updateUrl(userId), { params: { userId: id } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    verifyUser: async function (userId: any, id: any) {
        try {
            const response = await apiRequest.put(url(userId), { params: { userId: id } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    toggleActivateUser: async function (userId: any, id: any, isActive: any) {
        try {
            const response = await apiRequest.patch(url(userId), { isActive: isActive }, { params: { userId: id } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    changeRol: async function (userId: any, id: any, roleId: any) {
        try {
            const response = await apiRequest.patch(updateUrl(userId), { roleId: roleId }, { params: { userId: id } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (userId: any, id: any) {
        try {
            const response = await apiRequest.delete(url(userId), { params: { userId: id } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default roles;