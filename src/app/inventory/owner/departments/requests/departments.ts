import apiRequest from "@/api"
import { notifyError } from "@/utils/generalFunctions";
import { departments } from "@prisma/client";

const url = `/inventory/owner/departments/api`
const updateUrl = `/inventory/owner/departments/update/api`

const departmentsRequests = {
    getAllUserDepartments: async function (userId: number) {
        try {
            const response = await apiRequest.get(url, { params: { userId } })
            return response.data;
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    getDepartmentDetails: async function (departmentId: number) {
        try {
            const response = await apiRequest.get(updateUrl, { params: { departmentId } })
            return response.data;
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },

    createDepartment: async function (data: departments) {
        try {
            await apiRequest.post(url, data);
            return true;
        } catch (e) {
            notifyError("Ha ocurrido un error creando el departamento")
        }
        return false
    },

    updateDepartment: async function (data: departments) {
        try {
            await apiRequest.put(url, data);
            return true;
        } catch (e) {
            notifyError("Ha ocurrido un error modificando el departamento")
        }
        return false
    },

    deleteDepartment: async function (departmentId: number) {
        try {
            const response = await apiRequest.delete(url, { params: { departmentId } })
            if (response.status === 200) return true
        } catch (e) {
            //ToDo: notify error here
        }
        return false
    },
}

export default departmentsRequests;