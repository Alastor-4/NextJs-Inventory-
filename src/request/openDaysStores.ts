import apiRequest from "@/api"
//const url = (userId: any) => `/profile/${userId}/store/apiOpenDays`

export const openDaysStores = {

    getDataStoreDay: async function (urlApi: string, storeId: number) {

        const response = await apiRequest.get(urlApi, { params: { storeId: storeId } });

        return response.data;
    },

    create: async function (urlApi: string, data: Object) {

        const response = await apiRequest.post(urlApi, data)

        return response.status
    },

    update: async function (urlApi: string, data: Object) {

        const response = await apiRequest.put(urlApi, data)

        return response.status
    },

    delete: async function (urlApi: string, id: any) {

        const response = await apiRequest.delete(urlApi, { params: { id: id } })

        return response.status
    }
}