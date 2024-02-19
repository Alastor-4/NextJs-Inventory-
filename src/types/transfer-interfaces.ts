import { characteristics, departments, images, stores } from "@prisma/client"

export interface TransferProduct {
    id: number
    name: string
    description: string
    characteristics: characteristics[]
    images: images[]
    departments: departments
}

export interface TransferDepots {
    id: number;
    product_id: number
    warehouse_id: number
    inserted_by_id: number
    product_total_units: number | null;
    product_total_remaining_units: number | null;
    products: TransferProduct
}
export interface offers {
    compare_units_quantity: number
    compare_function: string
    price_per_unit: number
    store_depot_id: number
    is_active: boolean
}

export interface TransferStoreDepots {
    store_id: number
    depot_id: number
    product_units: number
    product_remaining_units: number
    seller_profit_percentage: number | null
    is_active: boolean
    sell_price: string
    sell_price_unit: string
    seller_profit_quantity: number | null
    price_discount_percentage: number | null
    price_discount_quantity: number | null
    seller_profit_unit: number | null
    depots: TransferDepots
    stores: stores
    product_offers: offers[]
}

export interface DataTransferReceived {
    id: number
    store_depot_id: number
    units_transferred_quantity: number
    from_store_accepted: boolean
    to_store_id: number
    to_store_accepted: boolean
    transfer_notes: string
    transfer_cancelled: boolean
    created_at: Date
    store_depots: TransferStoreDepots
    transferStatus: 1 | 2 | 3
}