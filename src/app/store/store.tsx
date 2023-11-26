import {create} from 'zustand'

type StoreType = {
    loading: boolean,
    startLoading: () => void,
    stopLoading: () => void
}

export const useStore = create<StoreType>((set) => ({
    loading: false,
    startLoading: () => set(() =>  ({ loading: true})),
    stopLoading: () => set(() =>  ({ loading: false})),
}))

export const startLoading = useStore.getState().startLoading
export const stopLoading = useStore.getState().stopLoading
