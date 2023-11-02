import apiRequest from "@/api"
const url = (userId: any) => `/profile/${userId}/store/apiOpenDays`

export const openDaysStores = {
    create: async function (userId: any, data: Object) {

        const response = await apiRequest.post(url(userId), data)

        return response.status
    },

    update: async function (userId: any, data: Object) {

        const response = await apiRequest.put(url(userId), data)

        return response.status
    },

    delete: async function (userId: any, id: any) {

        const response = await apiRequest.delete(url(userId), { params: { id: id } })

        return response.status
    }
}