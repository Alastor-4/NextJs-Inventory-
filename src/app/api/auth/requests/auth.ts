import apiRequest from "@/api"
import bcrypt from "bcrypt"
import {notifyError} from "@/utils/generalFunctions";

const url = "/api/auth/register"

const auth = {
    register: async function ({username, password, name, mail, phone}: any) {
        try {
            const passwordHash = await bcrypt.hash(password, 10)
            const response = await apiRequest.post(url, {username, passwordHash, name, mail, phone,})
            return response.data
        } catch(e) {
            notifyError("Ha ocurrido un error en el proceso de registro del usuario")
        }

        return false
    }
}

export default auth;