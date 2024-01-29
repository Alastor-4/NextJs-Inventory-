import { notifyError } from "@/utils/generalFunctions";
import apiRequest from "@/api";

const showProductWarehouseUrl = `/inventory/keeper/store-assign/showProductApi/apiWarehouse`;
const showProductStoreUrl = `/inventory/keeper/store-assign/showProductApi/apiStore`;
const transactionUrl = `/inventory/keeper/store-assign/showProductApi/apiTransactions`;

const storeAssign = {
    //Peticiones del component ShowProductStore
    allProductsByDepartmentStore: async function (storeId: any) {
        try {
            const response = await apiRequest.get(showProductStoreUrl, { params: { storeId: storeId } })

            return response.data
        } catch (e) {
            notifyError(`Ha ocurrido un error obteniendo los datos de los productos`)
        }

        return false
    },

    updateProductStore: async function (data: any) {
        try {
            return await apiRequest.put(showProductStoreUrl, data)
        } catch (e) {
            notifyError(`Ha ocurrido un error modificando los datos`)
        }

        return false
    },

    updateProductWarehouse: async function (data: any) {
        try {
            return await apiRequest.put(showProductWarehouseUrl, data)
        } catch (e) {
            notifyError(`Ha ocurrido un error modificando los datos`)
        }

        return false
    },

    // Peticiones para el component ShowProductWarehouse
    createTransaction: async function (data: any) {
        try {
            const response = await apiRequest.post(transactionUrl, data)
            return response.status
        } catch (e) {
            notifyError("Error al registar la transacción")
        }

        return false
    }
}

export default storeAssign;