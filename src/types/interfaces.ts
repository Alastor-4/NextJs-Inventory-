import { characteristics, departments, images, store_depots, stores, warehouses } from "@prisma/client";

export interface ShowProductsStoreProps {
    userId?: number;
    storeId?: number;
    nameStore?: string | null;
    dataStore?: stores;
    dataWarehouse?: warehouses;
    warehouseId?: number;
    nameWarehouse?: string | null;
}

export interface ProductsMainTableProps {
    userId: number;
}

export interface productsProps {
    id: number;
    department_id: number | null;
    owner_id: number | null;
    name: string | null;
    description: string | null;
    buy_price: number | null;
    created_at: Date;
    depots?: {
        id: number;
        product_id: number | null;
        warehouse_id: number | null;
        inserted_by_id: number | null;
        product_total_units: number | null;
        product_total_remaining_units: number | null;
        created_at: Date;
        store_depots?: store_depots[];
    }[];
    departments?: departments;
    images?: images[];
    characteristics?: characteristics[];
    storesDistribution?: {
        id: number;
        owner_id: number | null;
        name: string | null;
        description: string | null;
        slogan: string | null;
        address: string | null;
        seller_user_id: number | null;
        created_at: Date;
        online_reservation: boolean | null;
        online_catalog: boolean | null;
        auto_open_time: boolean | null;
        auto_reservation_time: boolean | null;
        fixed_seller_profit_percentage: number | null;
        fixed_seller_profit_quantity: number | null;
        fixed_seller_profit_unit: string | null;
        store_depots?: store_depots[];
    }[];
}

export interface allProductsByDepartmentProps {
    id: number;
    name: string | null;
    description: string | null;
    created_at: Date;
    products?: productsProps[];
    selected?: boolean
}