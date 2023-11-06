import { NextResponse } from "next/server";
import { prisma } from "db";
import dayjs from "dayjs";


export async function GET(res: Request) {
    const { searchParams } = new URL(res.url);
    const storeId = parseInt(<string>searchParams.get("storeId"))

    const result = await prisma.store_reservation_days.findMany({ where: { store_id: storeId } })

    return NextResponse.json(result)
}

export async function POST(req: Request) {
    const { day_start_time, week_day_number, day_end_time, store_id } = await req.json()
    const data = {
        week_day_number,
        day_start_time: dayjs(day_start_time).toDate(),
        day_end_time: dayjs(day_end_time).toDate(),
        store_id: parseInt(store_id)
    }

    const result = await prisma.store_reservation_days.create({ data })

    return NextResponse.json(result)

}

export async function PUT(req: Request) {
    const { id, day_start_time, week_day_number, day_end_time, store_id } = await req.json()

    const data = {
        week_day_number,
        day_start_time: dayjs(day_start_time).toDate(),
        day_end_time: dayjs(day_end_time).toDate(),
        store_id: parseInt(store_id)
    }

    const result = await prisma.store_reservation_days.update({ data, where: { id: id } })

    return NextResponse.json(result);
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const weekDayId = parseInt(<string>searchParams.get("id"));

    const result = await prisma.store_reservation_days.delete({ where: { id: weekDayId } })

    return NextResponse.json(result);
}