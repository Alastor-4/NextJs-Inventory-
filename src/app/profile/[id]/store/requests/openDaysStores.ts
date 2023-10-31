import apiRequest from "@/api"
const url = (userId: any) => `/profile/${userId}/store/apiOpenDays`

export const openDaysStores = {
    create: async function (userId: any, data: Object) {

        const response = await apiRequest.post(url(userId), data)

        return response.status
    }
}