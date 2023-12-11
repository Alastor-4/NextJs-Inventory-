// @ts-nocheck
import apiRequest from "@/api"

const url = (userId) => `/profile/${userId}/worker/api`
const urlCreate = (userId) => `/profile/${userId}/worker/create/api`

const ownerUsers = {
    allWorkers: async function (userId: any) {
        try {
            const response = await apiRequest.get(url(userId))
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    changeRol: async function (userId: any, workerId: any, roleId: any) {
        try {
            const response = await apiRequest.patch(url(userId), {roleId: roleId}, {params: {userId: workerId}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    deleteWorker: async function (userId: any) {
        try {
            const response = await apiRequest.delete(url(userId), {params: {userId: userId}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    findNewUser: async function (userId: any, username: any, phone: any) {
        try {
            return await apiRequest.get(urlCreate(userId), {params: {username, phone}})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    addNewUser: async function (ownerId: any, userId: any) {
        try {
            return await apiRequest.put(urlCreate(userId), {userId}, {params: {ownerId}})
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default ownerUsers;