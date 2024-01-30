import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import { hashPassword } from "@/utils/serverActions";
import apiRequest from "@/api"

const url = "/api/auth/register";
const verifyRegisterDataUrl = "/api/auth/register/verify-register-data";

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
    }
}

export default auth;