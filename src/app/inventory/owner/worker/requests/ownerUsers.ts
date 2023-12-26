// @ts-nocheck
import apiRequest from "@/api";
import { notifyError } from "@/utils/generalFunctions";

const url = () => "/inventory/owner/worker/api";
const urlCreate = () => "/inventory/owner/worker/create/api";

const ownerUsers = {
    allWorkers: async function (userId: any) {
        try {
            const response = await apiRequest.get(url(), { params: { ownerId: userId } })
            return response.data
        } catch (e) {
            notifyError("Error al pedir los usuarios trabajadores")
        }

        return false
    },

    changeRol: async function (workerId?: number, roleId?: number) {
        try {
            const response = await apiRequest.patch(url(), { roleId: roleId }, { params: { userId: workerId } })
            return response.data
        } catch (e) {
            notifyError("Error al cambiar el rol del usuario")
        }

        return false
    },

    deleteWorker: async function (userId: any) {
        try {
            const response = await apiRequest.delete(url(), { params: { userId: userId } })
            if (response.status === 200) return true
        } catch (e) {
            notifyError("Error eliminando el usuario como trabajador")
        }

        return false
    },

    findNewUser: async function (username: any, phone: any) {
        try {
            return await apiRequest.get(urlCreate(), { params: { username, phone } })
        } catch (e) {
            notifyError("Error al buscar el usuario")
        }

        return false
    },

    addNewUser: async function (ownerId: any, userId: any) {
        try {
            return await apiRequest.put(urlCreate(), { userId }, { params: { ownerId } })
        } catch (e) {
            notifyError("Error agregando el usuario")
        }

        return false
    },
}

export default ownerUsers;