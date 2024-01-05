import { warehousesWithDepots } from '@/types/interfaces';
import { persist } from 'zustand/middleware';
import { warehouses } from '@prisma/client';
import { create } from 'zustand';

type StoreType = {
    loading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
    ownerProductsCount: number;
    ownerWarehouses: warehousesWithDepots[] | null;
    setProductsCount: (productsCount: number) => void;
    setOwnerwarehouses: (warehouses: warehouses[] | null) => void;
}

export const useStore = create<StoreType>()(
    persist(
        (set) => ({
            loading: false,
            ownerProductsCount: 0,
            setProductsCount: (productsCount) => set(() => ({ ownerProductsCount: productsCount })),
            ownerWarehouses: null,
            setOwnerwarehouses: (warehouses) => set(() => ({ ownerWarehouses: warehouses })),
            startLoading: () => set(() => ({ loading: true })),
            stopLoading: () => set(() => ({ loading: false })),
        }),
        {
            name: 'store',
            partialize: (state) => ({
                ownerProductsCount: state.ownerProductsCount,
                ownerWarehouses: state.ownerWarehouses
            }),
        })
);

export const startLoading = useStore.getState().startLoading;
export const stopLoading = useStore.getState().stopLoading;
export const setProductsCount = useStore.getState().setProductsCount;
export const setOwnerwarehouses = useStore.getState().setOwnerwarehouses;