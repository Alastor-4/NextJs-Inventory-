const { PrismaClient } = require('@prisma/client');

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {

    //roles and users
    await prisma.roles.create({
        data: {
            name: 'admin',
            description: 'Administrador del sistema',
            users: {
                create: {
                    username: "dgabad91",
                    name: "Dayan Gomez Abad",
                    mail: "dgabad91@gmail.com",
                    phone: "51698662",
                    password_hash: "$2a$10$x5GLfSkIGWV5j2sW9OMg6.LovR90KNsFB.JB2xF3rryn7rj3NwqeS",
                    is_verified: true,
                },
            },
        },
    })

    await prisma.roles.create({
        data: {
            name: 'store_owner',
            description: 'Dueño de tienda',
            users: {
                create: {
                    username: "dgabad93",
                    name: "Dayan Owner",
                    mail: "dgabad93@gmail.com",
                    phone: "51698663",
                    password_hash: "$2a$10$x5GLfSkIGWV5j2sW9OMg6.LovR90KNsFB.JB2xF3rryn7rj3NwqeS",
                    is_verified: true,
                    warehouses: {
                        create: {
                            name: "Almacén 1",
                            description: "Almacén principal",
                            address: "sin dirección",
                        }
                    }
                },
            },
        },
    })

    await prisma.roles.create({
        data: {
            name: 'store_keeper',
            description: 'Almacenero de la tienda',
        }
    })

    const ownerUser = await prisma.users.findFirst({ where: { roles: { name: "store_owner" } } })
    await prisma.roles.create({
        data: {
            name: 'store_seller',
            description: 'Vendedor de la tienda',
            users: {
                create: {
                    username: "dgabad94",
                    name: "Dayan Seller",
                    mail: "dgabad94@gmail.com",
                    phone: "51698664",
                    password_hash: "$2a$10$x5GLfSkIGWV5j2sW9OMg6.LovR90KNsFB.JB2xF3rryn7rj3NwqeS",
                    is_verified: true,
                    work_for_user_id: ownerUser.id
                },
            },
        },
    })

    await prisma.roles.create({
        data: {
            name: 'user',
            description: 'Usuario del sistema',
        }
    })

    //departments
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

    //reservation statuses
    await prisma.reservation_status.createMany({
        data: [
            {
                code: 1,
                name: 'Pendiente',
                description: 'La reservación fue creada por el usuario y esta Pendiene a revision por la tienda.',
            },
            {
                code: 2,
                name: 'Cancelada',
                description: 'La reservación fue Cancelada por la tienda y el producto en cuestión no será reservado.',
            },
            {
                code: 3,
                name: 'Reservado',
                description: 'El producto en cuestión ha sido Reservado.',
            },
            {
                code: 4,
                name: 'Vendido',
                description: 'El producto de esta reservacion ha sido Vendido.',
            },
            {
                code: 5,
                name: 'En camino',
                description: 'El producto reservado está De Camino a ser entregado.',
            },
            {
                code: 6,
                name: 'Entregado',
                description: 'El producto reservado fue Entregado.',
            },
        ],
    })

    //payment units
    await prisma.payment_units.createMany({
        data: [
            {
                name: 'CUP',
                description: 'CUP.',
            },
            {
                name: 'MLC',
                description: 'MLC.',
            },
            {
                name: 'USD',
                description: 'USD.',
            },
            {
                name: 'Otro',
                description: 'Otra moneda.',
            },
        ],
    })

    //payment methods
    await prisma.payment_methods.createMany({
        data: [
            {
                name: 'Efectivo CUP',
                description: 'Efectivo CUP.',
            },
            {
                name: 'Transferencia CUP',
                description: 'Transferencia CUP.',
            },
            {
                name: 'Efectivo USD',
                description: 'Efectivo USD.',
            },
            {
                name: 'Transferencia MLC',
                description: 'Transferencia MLC.',
            },
            {
                name: 'Transferencia Zelle',
                description: 'Transferencia mediante aplicación Zelle.',
            },
            {
                name: 'Otro',
                description: 'Otro método.',
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