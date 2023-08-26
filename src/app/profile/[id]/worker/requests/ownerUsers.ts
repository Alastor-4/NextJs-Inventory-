import apiRequest from "@/api"
import {headers} from "next/headers";

const url = (userId) => `/profile/${userId}/worker/api`

const ownerUsers = {
    allWorkers: async function (userId) {
        try {
            const response = await apiRequest.get(url(userId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    changeRol: async function (id, roleId) {
        try {
            const response = await apiRequest.patch(updateUrl, {roleId: roleId}, {params: {userId: id}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    deleteWorker: async function (userId) {
        try {
            const response = await apiRequest.delete(url(userId), {params: {userId: userId}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default ownerUsers;