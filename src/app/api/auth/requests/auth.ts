import apiRequest from "@/api"
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import { hashPassword } from "@/utils/serverActions";

const url = "/api/auth/register"

const auth = {
    register: async function ({ username, password1, name, mail, phone }: any) {

        try {
            const passwordHash = hashPassword(password1);
            const response = await apiRequest.post(url, { username, passwordHash, name, mail, phone, })
            notifySuccess(response.data.message);
            return response.data

        } catch (e) {
            notifyError("Ha ocurrido un error en el proceso de registro del usuario")
        }

        return false;
    }
}

export default auth;