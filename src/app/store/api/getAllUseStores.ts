import prisma from "db";
import { NextApiRequest as req, NextApiResponse as res } from "next"

export default async function getAllUserStores(req, res) {
    const userId = req.query.userId

    const stores = await prisma.stores.findMany({where: {ownerUserId: userId}})

    res.status(200).send(stores)
}