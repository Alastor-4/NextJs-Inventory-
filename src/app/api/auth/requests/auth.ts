import {notifyError, notifySuccess} from "@/utils/generalFunctions";
import {hashPassword} from "@/utils/serverActions";
import apiRequest from "@/api";
import {AxiosError} from "axios";

const url = "/api/auth/register";
const verifyRegisterDataUrl = "/api/auth/register/verify-register-data";
const urlRecoverPassword = "/api/auth/recover-password/api";

const auth = {
    register: async function ({ username, password, name, email, phone }: any) {
        try {
            const passwordHash = await hashPassword(password);
            const response = await apiRequest.post(url, { username, passwordHash, name, email, phone, });
            notifySuccess(response.data.message);
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error en el proceso de registro del usuario");
        }

        return false;
    },

    verifyRegisterData: async function (username: string, phone: string, email: string) {
        try {
            const response = await apiRequest.post(verifyRegisterDataUrl, { username, phone, email });
            return response.data;
        } catch (e) {
            notifyError("Ha ocurrido un error comprobando los datos de registro del usuario");
        }
    },

    sendEmailToFindUser: async function (email: string) {
        try {
            const response = await apiRequest.post(urlRecoverPassword, { email });
            if (response.status === 200) notifySuccess(response.data);
            return response.data;
        } catch (e) {
            notifyError("Ha ocurrido un error comprobando si existe el usuario");
        }
    },

    changePassword: async function (token: string, password: string) {
        try {
            const passwordHash = await hashPassword(password);

            return await apiRequest.patch(urlRecoverPassword, {token, passwordHash});
        } catch (error: any) {
            if (error.code === "ERR_BAD_REQUEST") {
                return error.response.data
            } else {
                notifyError("Ha ocurrido un error cambiando la contraseña")
            }
        }

        return false
    }
}

export default auth;