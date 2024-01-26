import { characteristics, departments, depots, images, product_offers, products, sell_products, sells, users, warehouses, store_depots, reservations, reservation_products, Prisma, stores, store_open_days, store_reservation_days } from '@prisma/client';
import { ReactNode } from "react";

export interface ShowProductsStoreProps {
    userId?: number;
    storeId?: number;
    nameStore?: string | null;
    dataStore?: storeWithStoreDepots;
    dataWarehouse?: warehouses;
    warehouseId?: number;
    nameWarehouse?: string | null;
}

export interface storeWithStoreDepots {
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
    store_open_days?: {
        id: number;
        week_day_number: number;
        day_start_time: Date;
        day_end_time: Date;
        store_id: number;
    }[];
    store_reservation_days?: {
        id: number;
        week_day_number: number;
        day_start_time: Date;
        day_end_time: Date;
        store_id: number;
    }[];
    store_depots?: {
        id: number;
        store_id: number | null;
        depot_id: number | null;
        product_units: number | null;
        product_remaining_units: number | null;
        seller_profit_percentage: number | null;
        created_at: Date;
        discount_description: string | null;
        is_active: boolean | null;
        sell_price: any | null;
        sell_price_unit: string | null;
        seller_profit_quantity: number | null;
        price_discount_percentage: number | null;
        price_discount_quantity: number | null;
        seller_profit_unit: string | null;
        product_offers?: product_offers[] | null;
    }[];
}
export interface ModalUpdateProductProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    dialogTitle: string;
    children?: ReactNode;
    handleForceRender?: () => void;
}
export interface ProductsFormProps {
    userId: number;
    departments: departments[] | null;
    productId: number | null;
    handleForceRender: () => void;
    setOpen: (bool: boolean) => void;
}
export interface AddProductFromWarehouseProps {
    dataStore?: storeWithStoreDepots;
    warehouseId?: number | null;
}

export interface UpdateValueDialogProps {
    open: boolean;
    setOpen: (boolean: boolean) => void;
    dialogTitle: string;
    children: ReactNode;
    formik?: any;
    fullScreen?: boolean;
}

export interface storeDepotsStatsProps {
    depotsTotal: number;
    depotsRemainingUnitsTotal: number;
    depotsNotRemainingUnitsTotal: number;
    depotsNotActiveTotal: number;
    depotsWithoutPriceTotal: number;
    depotsWithDiscountTotal: number;
}
export interface StoreMainTableProps {
    userId?: number;
}

export interface StoreActionsMainProps {
    storeId?: number;
}

export interface TransferBetweenStoresProps {
    storeId: number;
    storeDepot: storeDepotsWithAny;
    badItem: number;
    cancelChecked: (badItem: number) => void;
    loadData: () => void;
}
export interface departmentsWithProductsCount {
    id: number;
    name: string | null;
    description: string | null;
    created_at: Date | null;
    usersId: number | null;
    products: number;
}

export interface ModalCreateUpdateDepartmentProps {
    userId?: number;
    isOpen: boolean;
    setIsOpen: (bool: boolean) => void;
    dialogTitle: string;
    handleForceRender: () => void;
    department?: allProductsByDepartmentProps | null;
}
export interface ProductsMainTableProps {
    userId: number;
}
export interface DepartmentsMainTableProps {
    userId: number;
}

export interface ModalProductPriceProps {
    activeModalPrice: boolean;
    dialogTitle: string;
    setActiveModalPrice: React.Dispatch<React.SetStateAction<{
        active: boolean;
        storeDepot: storeDepotsWithAny | null;
    }>>
    storeDepot: storeDepotsWithAny | null
    loadData: () => Promise<void>;

}

export interface ModalAddProductFromWarehouseProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    dialogTitle?: string;
    loadData: () => Promise<void>;
    children?: ReactNode;
}

export interface ModalStoreAssignProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    dialogTitle: string;
    nameStore: string;
    nameWarehouse: string;
    productDetails: productsProps;
    updateDepot: (addUnits: number, depot: depots) => Promise<void>;
    setActiveManageQuantity: (bool: boolean) => void;
}

export interface warehousesWithDepots {
    id: number;
    owner_id: number | null;
    name: string | null;
    description: string | null;
    address: string | null;
    created_at: Date;
    depots?: depots[] | null;
    users?: users | null;
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
        store_depots?: {
            id: number;
            store_id: number | null;
            depot_id: number | null;
            product_units: number | null;
            product_remaining_units: number | null;
            seller_profit_percentage: number | null;
            created_at: Date;
            discount_description: string | null;
            is_active: boolean | null;
            sell_price: any | null;
            sell_price_unit: string | null;
            seller_profit_quantity: number | null;
            price_discount_percentage: number | null;
            price_discount_quantity: number | null;
            seller_profit_unit: string | null;
            product_offers?: product_offers[] | null;
            _count?: {
                product_offers: number
            }
        }[];
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
        store_depots?: {
            id: number;
            store_id: number | null;
            depot_id: number | null;
            product_units: number | null;
            product_remaining_units: number | null;
            seller_profit_percentage: number | null;
            created_at: Date;
            is_active: boolean | null;
            discount_description: string | null;
            sell_price: any | null;
            sell_price_unit: string | null;
            seller_profit_quantity: number | null;
            price_discount_percentage: number | null;
            price_discount_quantity: number | null;
            seller_profit_unit: string | null;
            product_offers?: product_offers[] | null;
        }[];
    }[];
}

export interface storeDepotsWithAny {
    id: number;
    store_id: number | null;
    depot_id: number | null;
    product_units: number | null;
    product_remaining_units: number | null;
    seller_profit_percentage: number | null;
    created_at: Date;
    discount_description: string | null;
    is_active: boolean | null;
    sell_price: any | null;
    sell_price_unit: string | null;
    seller_profit_quantity: number | null;
    price_discount_percentage: number | null;
    price_discount_quantity: number | null;
    seller_profit_unit: string | null;
    product_offers?: product_offers[] | null;
    depots?: {
        id: number;
        product_id: number | null;
        warehouse_id: number | null;
        inserted_by_id: number | null;
        product_total_units: number | null;
        product_total_remaining_units: number | null;
        created_at: Date;
        warehouses?: warehouses | null;
        products?: {
            id: number;
            department_id: number | null;
            owner_id: number | null;
            name: string | null;
            description: string | null;
            buy_price: number | null;
            created_at: Date;
            departments?: departments | null
        } | null;
    } | null
}

export interface SellsMoreDetailsProps {
    sell_products: {
        id: number;
        sell_id: number;
        store_depot_id: number;
        units_quantity: number;
        price: number;
        created_at: Date;
        store_depots: storeDepotsWithAny;
    }[];
    show: boolean;
}
export interface ModalSellsTodayProps {
    isOpen: boolean;
    setIsOpen: (bool: boolean) => void;
    dialogTitle: string;
    todaySellsData: storeSellsDetailsProps[];
}
export interface StoreModalDefaultProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    children?: ReactNode;
    dialogTitle?: string;
}

export interface storeSellsDetailsProps {
    id: number;
    total_price: number | null;
    payment_method: string | null;
    units_returned_quantity: number | null;
    created_at: Date;
    returned_at: Date | null;
    returned_reason: string | null;
    from_reservation_id: number | null;
    requesting_user_id: number | null;
    reservations?: {
        id: number;
        payment_method: string | null;
        created_at: Date;
        requesting_user_id: number;
        request_delivery: boolean;
        delivery_notes: string | null;
        status_description: string | null;
        status_id: number;
        total_price: number;
        reservation_products: {
            id: number;
            reservation_id: number;
            store_depot_id: number;
            units_quantity: number;
            price: number;
            applied_offer: Prisma.JsonValue;
            applied_discount: Prisma.JsonValue;
            created_at: Date;
            store_depots: storeDepotsWithAny;
        }[];
    } | null;
    sell_products: {
        id: number;
        sell_id: number;
        store_depot_id: number;
        units_quantity: number;
        price: number;
        created_at: Date;
        store_depots: storeDepotsWithAny;
    }[];
}

export interface TransferUnitsProps {
    nameStore: string | null;
    storeDepot: storeDepotsWithAny | null;
    productId: number | null
    setActiveTransferUnits: (bool: boolean) => void;
    loadData: () => Promise<void>;
}
export interface productSellsStatsProps {
    sellsTotal: number;
    sellsAmountTotal: number;
    sellerProfitTotal: number;
    sellsUnitsReturnedTotal: number;
    normalSellsTotal: number;
    normalSellsDifferentProductsTotal: number;
    normalSellsProductsQuantity: number;
    normalSellsAmountTotal: number;
    normalSellerProfitTotal: number;
    normalSellsUnitsReturnedTotal: number;
    reservationSellsTotal: number;
    reservationSellsAmountTotal: number;
    reservationSellerProfitTotal: number;
    reservationSellsUnitsReturnedTotal: number;
}
export interface StoreEditUnitsProps {
    loadData: () => Promise<void>;
    setActiveModalEditUnits: (bool: boolean) => void;
    dataRow: any | null;
}
export interface StoreEditSellerProfitProps {
    loadData: () => Promise<void>;
    storeDepot: storeDepotsWithAny | null;
    setActiveModalSellerProfit: (bool: boolean) => void;
}
export interface StoreEditPriceProps {
    loadData: () => Promise<void>;
    storeDepot: storeDepotsWithAny | null;
    setActiveModalPrice: ({ active, storeDepot }: { active: boolean, storeDepot: storeDepotsWithAny | null }) => void;
}

export interface StoreModalPriceProps {
    open: boolean;
    setOpen: ({ active, storeDepot }: { active: boolean, storeDepot: storeDepotsWithAny | null }) => void;
    children?: ReactNode;
    dialogTitle?: string;
}
export interface allProductsByDepartmentProps {
    id: number;
    name: string | null;
    description: string | null;
    created_at: Date | null;
    usersId?: number | null;
    products?: productsProps[];
    selected?: boolean
}

export interface departmentWithoutDepots {
    id: number;
    name: string | null;
    description: string | null;
    created_at: Date;
    selected?: boolean
    products?: products | null
}

export interface StoreDepotsAssignProps {
    userId?: number;
    selectedWarehouseId?: number;
    selectedStoreId?: number;
    storeList?: storeWithStoreDepots[];
    warehouseList?: warehouses[];
}

export interface UserWarehouseFormProps {
    ownerId?: number;
    warehouseId?: number;
    dataAllProducts?: productsProps[] | null;
}

export interface UserWarehouseMainTableProps {
    ownerId?: number;
    warehouseDetails?: warehouses | null;
}