import { create } from 'zustand';

type StoreType = {
    loading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
    ownerProductsCount: number;
    setProductsCount: (productsCount: number) => void;
}

export const useStore = create<StoreType>((set) => ({
    loading: false,
    ownerProductsCount: 0,
    setProductsCount: (productsCount) => set(() => ({ ownerProductsCount: productsCount })),
    startLoading: () => set(() => ({ loading: true })),
    stopLoading: () => set(() => ({ loading: false })),
}))

export const startLoading = useStore.getState().startLoading;
export const stopLoading = useStore.getState().stopLoading;
export const setProductsCount = useStore.getState().setProductsCount;