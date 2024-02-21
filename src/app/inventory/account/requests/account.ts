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
            notifyError("Error obteniendo los datos");
        }
        return false;
    },

    // changeAccountData: async function ({ userId, name, picture, file }: any) {
    //     try {
    //         const response = await apiRequest.put(url, { userId, name, picture, file });
    //         console.log(response);

    //         return response.data
    //         // if (response.status === 200) notifySuccess("Datos actualizados correctamente");
    //         // return response.status;
    //     } catch (e) {
    //         notifyError("Error actualizando los datos");
    //     }
    //     return false;
    // },

    changeAccountPassword: async function (userId: number, oldPassword: string, password: string) {
        try {
            const passwordHash = await hashPassword(password);
            const response = await apiRequest.patch(url, { oldPassword: oldPassword, passwordHash: passwordHash }, { params: { userId: userId } });
            if (response.status === 201) notifySuccess(response.data);
            return response.data;
        } catch (error) {
            notifyError("Ha fallado la acción de cambiar la contraseña");
        }
    },
}

export default account;