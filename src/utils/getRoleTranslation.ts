export const getRoleTranslation = (roleName: string) => {
    switch (roleName) {
        case "admin":
            return "Admin"
        case "store_owner":
            return "Dueño"
        case "store_keeper":
            return "Almacenero"
        case "store_seller":
            return "Vendedor"
        default:
            return "Usuario"
    }
}