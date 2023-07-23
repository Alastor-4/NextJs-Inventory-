import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    await prisma.roles.create({
        data: [
            {
                name: 'admin',
                description: 'Administrador del sistema',
                users: [
                    {
                        username: "dgabad91",
                        name: "Dayan Gomez Abad",
                        mail: "dgabad91@gamil.com",
                        phone: "51698662",
                    }
                ]
            },
            {
                name: 'store_owner',
                description: 'Dueño de tienda',
            },
            {
                name: 'store_keeper',
                description: 'Almacenero de la tienda',
            },
            {
                name: 'store_seller',
                description: 'Vendedor de la tienda',
            },
            {
                name: 'user',
                description: 'Usuario del sistema',
            },
        ]
    })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })