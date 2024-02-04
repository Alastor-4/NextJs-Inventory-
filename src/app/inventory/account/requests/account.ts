import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import { hashPassword } from "@/utils/serverActions";
import apiRequest from "@/api";

const url = `/inventory/account/api`;

const account = {
    getAccountData: async function (userId: number) {
        try {
            const response = await apiRequest.get(url, { params: { userId } });
            return response.data;
        } catch (e) {
            notifyError("Error obteniendo los datos")
        }
        return false
    },

    changeAccountData: async function ({ userId, name, username, phone, email }: any) {
        try {
            const response = await apiRequest.put(url, { userId, name, username, phone, email });
            if (response.status === 200) notifySuccess("Datos actualizados correctamente");
            return response.status;
        } catch (e) {
            notifyError("Error actualizando los datos")
        }

        return false
    },

    changeAccountPassword: async function (userId: number, password: string) {
        try {
            const passwordHash = await hashPassword(password);
            const response = await apiRequest.patch(url, { passwordHash: passwordHash }, { params: { userId: userId } });
            if (response.status === 201) notifySuccess(response.data);
            return response.data
        } catch (error) {
            notifyError("Ha fallado la acción de cambiar la contraseña");
        }
    },
}

export default account;