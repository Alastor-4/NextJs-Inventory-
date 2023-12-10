import apiRequest from "@/api"
import { compare, compareSync, hashSync } from "bcrypt"

import { notifyError } from "@/utils/generalFunctions";

const url = "/api/auth/register"

const auth = {
    register: async function ({ username, password1, name, mail, phone }: any) {

        try {
            // const passwordHash = await hashSync(password1, 10)
            // console.log(passwordHash)
            const response = await apiRequest.post(url, { username, password1, name, mail, phone, })
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error en el proceso de registro del usuario")
        }

        return false
    }
}

export default auth;