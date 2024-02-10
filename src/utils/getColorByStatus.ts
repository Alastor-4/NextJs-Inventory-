export const getColorByStatus = (status: string) => {
    switch (status) {
        case "PENDIENTE":
            return "warning"
        case "CANCELADA":
            return "error"
        case "store_keeper":
            return "error"
        case "COBRADA":
            return "success"
        case "EXTENDIDA":
            return "primary"
        default:
            return "info"
    }
}