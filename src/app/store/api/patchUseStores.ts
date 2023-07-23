import prisma from "db";
import { NextApiRequest as req, NextApiResponse as res } from "next"

export default async function patchUserStores(req, res) {
    const userId = req.query.userId
    const storeId = req.query.storeId
    const {name, description, slogan, address, sellerUserId} = req.body

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
}