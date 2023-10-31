import { NextResponse } from "next/server";
import { prisma } from "db";
import dayjs from "dayjs";

export async function POST(req: Request) {
    const { day_start_time, week_day_number, day_end_time, store_id } = await req.json()
     console.log('aaaaaaaaaaaaaa')
     console.log( dayjs(day_start_time).toDate() )
    const data = {
        week_day_number, 
        day_start_time: dayjs(day_start_time).toDate(),
        day_end_time: dayjs(day_end_time).toDate(),
        store_id: parseInt(store_id)
    }
    console.log( data.day_start_time )
    const result = await prisma.store_open_days.create({ data })

    return NextResponse.json(result)

}