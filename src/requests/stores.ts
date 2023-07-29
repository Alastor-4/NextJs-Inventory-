import type {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from "db";

export async function getAllRoles() {
    try {
        return await prisma.roles.findMany()
    } catch (e) {
        throw new Error(e)
    }
}

export async function storeHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req

    const {userId, storeId} = query
    const {name, description, slogan, address, sellerUserId} = body

    switch (method) {
        case 'GET':
            // Get all user stores
            const stores = await prisma.stores.findMany({where: {ownerUserId: userId}})

            res.status(200).send(stores)

            break

        case 'POST':
            // Create new user store with default departments
            const newStore = await prisma.stores.create(
                {
                    data: {
                        ownerUserId: userId,
                        name,
                        description,
                        slogan,
                        address,
                        sellerUserId,
                    }
                }
            )

            await prisma.departments.createMany({data: defaultDepartments.map(item => ({...item, storeId: newStore.id}))})

            res.status(201).send(newStore)

            break

        case 'PUT':
            // Update user store
            let userStore = await prisma.stores.findFirst({where: {id: storeId, ownerUserId: userId}})

            if (userStore) {
                userStore = await prisma.stores.update(
                    {
                        where: {id: storeId, ownerUserId: userId},
                        data: {name, description, slogan, address, sellerUserId}
                    }
                )

                res.status(200).send(userStore)
            } else {
                res.status(400).send({message: "User store not found"})
            }

            break

        default:
            res.setHeader('Allow', ['GET', 'PUT'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }




}