import dayjs from "dayjs";
import {enqueueSnackbar} from "notistack";

export const numberFormat = (number: string) => parseFloat((Math.round(parseFloat(number.toString()) * 100) / 100).toFixed(2))

export const dateFormat = (date: string, includeTime: boolean) => dayjs(date).format(includeTime ? "DD/MM/YYYY hh:mm A" : "DD/MM/YYYY")

export const daysMap = {
    1: "Domingo",
    2: "Lunes",
    3: "Martes",
    4: "Miércoles",
    5: "Jueves",
    6: "Viernes",
    7: "Sábado",
}

export const notifySuccess = (message: string) => enqueueSnackbar(message, {variant: "success"})
export const notifyError = (message: string) => enqueueSnackbar(message, {variant: "error"})
export const notifyWarning = (message: string) => enqueueSnackbar(message, {variant: "warning"})