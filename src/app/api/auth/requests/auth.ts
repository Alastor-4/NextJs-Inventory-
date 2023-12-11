import apiRequest from "@/api"
import { compare, compareSync, hashSync } from "bcrypt"

import { notifyError } from "@/utils/generalFunctions";
import { hashPassword } from "@/utils/serverActions";

const url = "/api/auth/register"

const auth = {
    register: async function ({ username, password1, name, mail, phone }: any) {

        try {
            const passwordHash = await hashPassword(password1);
            const response = await apiRequest.post(url, { username, passwordHash, name, mail, phone, })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error en el proceso de registro del usuario")
        }

        return false
    }
}

export default auth;