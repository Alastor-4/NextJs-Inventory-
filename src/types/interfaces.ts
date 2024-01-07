import { characteristics, departments, depots, images, products, store_depots, stores, users, warehouses } from "@prisma/client";
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
    store_depots?: store_depots[];
}
export interface ModalUpdateProductProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    dialogTitle: string;
    handleForceRender: () => void;
    children?: ReactNode;
}
export interface ManageQuantityProps {
    userId: number;
    nameStore: string;
    nameWarehouse: string;
    productDetails: productsProps;
    updateDepot: (addUnits: number, depot: depots) => Promise<void>;
    setActiveManageQuantity: (bool: boolean) => void;
}

export interface AddProductFromWarehouseProps {
    dataStore?: storeWithStoreDepots;
    warehouseId?: number;
}

export interface UpdateValueDialogProps {
    open: boolean;
    setOpen: (boolean: boolean) => void;
    dialogTitle: string;
    children: ReactNode;
    formik?: any;
}

export interface ProductsMainTableProps {
    userId: number;
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
    children?: ReactNode;
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
    depotsInWarehouses?: number | null;
}

export interface UserWarehouseMainTableProps {
    ownerId?: number;
    warehouseDetails?: warehouses | null;
}