import { notifyError } from "@/utils/generalFunctions";
import apiRequest from "@/api";

const url = "/inventory/api";

export const userStatsRequest = {
    defaultStats: async function (userId: any) {
        try {
            const response = await apiRequest.get(url, { params: { userId } })
            return response.data
        } catch (e) {
            notifyError("Algo ha fallado mientras se obtenían los datos del usuario")
        }

        return false
    },
}