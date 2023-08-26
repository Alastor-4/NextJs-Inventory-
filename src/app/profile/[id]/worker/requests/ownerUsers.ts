import apiRequest from "@/api"
import {headers} from "next/headers";

const url = (userId) => `/profile/${userId}/worker/api`
const ownerUsers = {
    allUser: async function (userId) {
        try {
            const response = await apiRequest.get(url(userId), {params: {ownerId: userId}})
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },
}

export default ownerUsers;