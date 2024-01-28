import { notifyError } from "@/utils/generalFunctions";
import apiRequest from "@/api";

const url = `/inventory/keeper/product/api`;
const updateUrl = `/inventory/keeper/product/update/api`;
const urlApiDepartments = `/inventory/keeper/product/apiDepartments`;

const products = {
    allOwnerProductDepartments: async function (ownerId?: number) {
        try {
            const response = await apiRequest.get(url, { params: { ownerId: ownerId! } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    productDetails: async function (productId: number) {
        try {
            const response = await apiRequest.get(updateUrl, { params: { productId: productId } })
            return response.data
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    create: async function (data: any) {
        try {
            return await apiRequest.post(url, data);
        } catch (e) {
            notifyError("Ha ocurrido un error creando el producto");
        }

        return false;
    },

    update: async function (data: any) {
        try {
            return await apiRequest.put(url, data);
        } catch (e) {
            //ToDo: notify error here
        }

        return false;
    },

    insertImages: async function ({ productId, productImages }: any) {
        try {
            return await apiRequest.patch(url, { productId, productImages });
        } catch (e) {
            //ToDo: notify error here
        }

        return false;
    },

    delete: async function (productId: number) {
        try {
            const response = await apiRequest.delete(url, { params: { productId: productId } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }

        return false
    },

    getDepartmentsByOnwerAndGlobal: async function (ownerId?: number) {
        try {
            const response = await apiRequest.get(urlApiDepartments, { params: { ownerId } });
            return response.data
        } catch (e) {
            notifyError("Error al obtener los departamentos")
        }
        return false
    }
}

export default products;