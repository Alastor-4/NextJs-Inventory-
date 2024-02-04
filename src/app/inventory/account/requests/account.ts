import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import { hashPassword } from "@/utils/serverActions";
import apiRequest from "@/api";

const url = `/inventory/account/api`;

const account = {
    changeData: async function () {
        try {
            const response = await apiRequest.put(url);
            return response.data;
        } catch (e) {
            notifyError("Ha fallado la acción de obtener los detalles de los usuarios")
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