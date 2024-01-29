import { notifyError } from "@/utils/generalFunctions";
import apiRequest from "@/api";

const updateUrl = "/inventory/keeper/store/update/api";

const stores = {
    storeDetails: async function (ownerId: number, storeId: any) {
        try {
            const response = await apiRequest.get(updateUrl, { params: { id: ownerId, storeId: storeId } })
            return response.data
        } catch (e) {
            notifyError("Algo ha fallado mientras se obtenían los datos de la tienda")
        }

        return false
    },
}

export default stores;