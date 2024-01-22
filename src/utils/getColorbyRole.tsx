export const getColorByRole = (roleName: string) => {
    switch (roleName) {
        case "admin":
            return "primary"
        case "store_owner":
            return "secondary"
        case "store_keeper":
            return "error"
        case "store_seller":
            return "success"
        default:
            return "info"
    }
}