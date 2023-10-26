// @ts-nocheck
import apiRequest from "@/api"

const url = "/user/api"
const updateUrl = "/user/update/api"

const roles = {
    allUsers: async function () {
        try {
            const response = await apiRequest.get(url)
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    userDetails: async function (id) {
        try {
            const response = await apiRequest.get(updateUrl, {params: {userId: id}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    verifyUser: async function (id) {
        try {
            const response = await apiRequest.put(url, {params: {userId: id}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    toggleActivateUser: async function (id, isActive) {
        try {
            const response = await apiRequest.patch(url, {isActive: isActive}, {params: {userId: id}})
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

    delete: async function (id) {
        try {
            const response = await apiRequest.delete(url, {params: {userId: id}})
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default roles;