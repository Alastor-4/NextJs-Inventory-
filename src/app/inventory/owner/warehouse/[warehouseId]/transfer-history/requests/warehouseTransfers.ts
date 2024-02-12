import apiRequest from "@/api"
import {notifyError} from "@/utils/generalFunctions";

const url = (warehouseId: number) => `/inventory/owner/warehouse/${warehouseId}/transfer-history/api`

const warehouseTransfers = {
    allWarehouseTransfers: async function (warehouseId: number) {
        try {
            const response = await apiRequest.get(url(warehouseId))
            return response.data
        } catch (e) {
            notifyError("Ha ocurrido un error obteniendo las trasferencias del almacén")
        }

        return false
    },
}

export default warehouseTransfers;