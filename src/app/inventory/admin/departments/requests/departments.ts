import { notifyError } from "@/utils/generalFunctions";
import { departments } from "@prisma/client";
import apiRequest from "@/api";

const url = `/inventory/admin/departments/api`;
const updateUrl = `/inventory/admin/departments/update/api`;

const departmentsRequests = {
    getAllGlobalDepartments: async function () {
        try {
            const response = await apiRequest.get(url)
            return response.data;
        } catch (e) {
            notifyError("Error al cargar los departamentos");
        }
        return false
    },

    getDepartmentDetails: async function (departmentId: number) {
        try {
            const response = await apiRequest.get(updateUrl, { params: { departmentId } })
            return response.data;
        } catch (e) {
            notifyError("Error al obtener la información del departamento");
        }
        return false
    },

    createDepartment: async function (data: departments) {
        try {
            await apiRequest.post(url, data);
            return true;
        } catch (e) {
            notifyError("Ha ocurrido un error creando el departamento");
        }
        return false
    },

    updateDepartment: async function (data: departments) {
        try {
            await apiRequest.put(url, data);
            return true;
        } catch (e) {
            notifyError("Ha ocurrido un error modificando el departamento");
        }
        return false
    },

    deleteDepartment: async function (departmentId: number) {
        try {
            await apiRequest.delete(url, { params: { departmentId } })
            return true
        } catch (e) {
            notifyError("Ha ocurrido un error eliminando el departamento");
        }
        return false
    },
}

export default departmentsRequests;