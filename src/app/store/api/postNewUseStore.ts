import prisma from "db";
import { NextApiRequest as req, NextApiResponse as res } from "next"

const defaultDepartments = [
    {name: "Ropa de niño", description: "Pantalones, shorts, pullovers y camisas de niños pequeños"},
    {name: "Calzado de niño", description: "Zapitos, Yipsi y sandalias para niños pequeños"},
    {name: "Zapatillas", description: "Zapatillas para hombres y mujeres"},
    {name: "Sandalias", description: "Sandalias para mujeres"},
    {name: "Chancletas", description: "Yipsi, sapitos y chancletas para hombres y mujeres"},
    {name: "Ropa de mujer", description: "Pantalones, shorts, pullovers, licras, vestidos, conjuntos de short y pullovers, y más para mujeres"},
    {name: "Ropa de hombre", description: "Pantalones, shorts, pullovers, camisas, y más para hombre"},
    {name: "Talabartería", description: "Cintos, carteras, mochilas"},
    {name: "Miscelaneas", description: "Relojes digitales, relojes inteligentes, pellizcos, pilas, velas, pegamento"},
    {name: "Electrodomésticos", description: "Cafeteras, Ollas Reina"},
]

export default async function postNewUserStore(req, res) {
    const userId = req.query.userId
    const {name, description, slogan, address, sellerUserId} = req.body

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

    await prisma.departments.create({data: defaultDepartments.map(item => ({...item, storeId: newStore.id}))})

    res.status(201).send(newStore)
}