import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(req: Request) {

    const result = await prisma.departments.findMany()

    return NextResponse.json(result)

}