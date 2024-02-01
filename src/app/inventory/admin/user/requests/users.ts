import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import apiRequest from "@/api";
import { hashPassword } from "@/utils/serverActions";

const url = `/inventory/admin/user/api`;
const updateUrl = `/inventory/admin/user/update/api`;

const users = {
    allUsers: async function () {
        try {
            const response = await apiRequest.get(url);
            return response.data;
        } catch (e) {
            notifyError("Ha fallado la acción de obtener los detalles de los usuarios")
        }

        return false
    },

    userDetails: async function (userId: any) {
        try {
            const response = await apiRequest.get(updateUrl, { params: { userId: userId } })
            return response.data
        } catch (e) {
            notifyError("Ha fallado la acción de obtener los detalles del usuario")
        }

        return false
    },

    verifyUser: async function (id: any) {
        try {
            const response = await apiRequest.put(url, { userId: id });
            return response.data
        } catch (e) {
            notifyError("Ha fallado la acción de verificar el usuario")
        }

        return false
    },

    toggleActivateUser: async function (id: any, isActive: any) {
        try {
            const response = await apiRequest.patch(url, { isActive: isActive }, { params: { userId: id } })
            return response.data
        } catch (e) {
            notifyError("Ha fallado la acción de habilitar/deshabilitar el usuario")
        }

        return false
    },

    changePassword: async function (userId: number, password: string) {
        try {
            const passwordHash = await hashPassword(password);
            const response = await apiRequest.put(updateUrl, { passwordHash: passwordHash }, { params: { userId: userId } });
            if (response.status === 201) notifySuccess(response.data);
            return response.data
        } catch (error) {
            notifyError("Ha fallado la acción de cambiar la contraseña");
        }
    },

    changeRol: async function (id?: number, roleId?: number) {
        try {
            const response = await apiRequest.patch(updateUrl, { roleId: roleId! }, { params: { userId: id } });
            return response.data
        } catch (e) {
            notifyError("Ha fallado la acción de cambiar el rol")
        }
        return false
    },

    createMainWarehouse: async function (ownerId: number) {
        try {
            const response = await apiRequest.post(updateUrl, { ownerId })
            return response.data;
        } catch (e) {
            notifyError("Ha fallado la creación del almacén para el owner");
        }

        return false
    },
}

export default users;