import { storeSellsReceivableDetailsProps } from "@/types/interfaces";

const calcSellReceivableProductsUnits = (sells: storeSellsReceivableDetailsProps): number => {
    let sellProductsUnits = 0;
    for (const sell_receivable_products of sells.sell_receivable_products) {
        if (sell_receivable_products.units_quantity) {
            sellProductsUnits += sell_receivable_products.units_quantity;
        }
    }
    return sellProductsUnits;
}

export default calcSellReceivableProductsUnits