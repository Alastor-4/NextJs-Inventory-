import apiRequest from "@/api"

const url = "/api/auth/register"

const auth = {
    register: async function () {
        try {
            const response = await apiRequest.get(url)
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    //ToDo: implement request for auth routes
}

export default auth;