import apiRequest from "@/api"

const url = "/role/api"

const roles = {
    allRoles: async function () {
        try {
            const response = await apiRequest.get(url)
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function ({name, description}) {
        try {
            return await apiRequest.post(url, {name, description})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    update: async function ({id, name, description}) {
        try {
            return await apiRequest.put(url, {roleId: id, name, description})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    delete: async function (id) {
        try {
            const response = await apiRequest.delete(url, {data: {roleId: id}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default roles;