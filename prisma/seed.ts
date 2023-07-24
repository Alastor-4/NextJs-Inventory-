const { PrismaClient } = require('@prisma/client');

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
    const adminRole = await prisma.roles.create({
        data: {
            name: 'admin',
            description: 'Administrador del sistema',
        }
    })

    await prisma.users.create({
        data: {
            username: "dgabad91",
            role_id: adminRole.id,
            name: "Dayan Gomez Abad",
            mail: "dgabad91@gamil.com",
            phone: "51698662",
        },
    })

    await prisma.roles.createMany({
        data: [
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
        ],
    })
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // close Prisma Client at the end
        await prisma.$disconnect();
    });