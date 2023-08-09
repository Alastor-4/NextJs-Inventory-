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
            is_verified: true,
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

    await prisma.departments.createMany({
        data: [
            {
                name: 'Zapatos de niño',
                description: 'Todo tipo de zapatos para niños y niñas',
            },
            {
                name: 'Zapatos de mujer',
                description: 'Zapatillas y sandalias para mujeres',
            },
            {
                name: 'Zapatos de hombre',
                description: 'Zapatillas y chancletas para hombres',
            },
            {
                name: 'Ropa de mujer',
                description: 'Pantalones, pesqueras, blusas, vestidos y licras de mujer',
            },
            {
                name: 'Ropa de hombre',
                description: 'Pantalones, pesqueras, camisas y shorts de hombre',
            },
            {
                name: 'Talabartería',
                description: 'Cintos, carteras, riñoneras y mochilas',
            },
            {
                name: 'Bisutería',
                description: 'Artículos varios de bisutería',
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