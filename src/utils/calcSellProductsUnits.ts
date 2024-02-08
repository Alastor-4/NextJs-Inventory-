import { sellsWithSellProducts } from "@/types/interfaces";

const calcSellProductsUnits = (sells: sellsWithSellProducts): number => {
    let sellProductsUnits = 0;
    for (const sell_product of sells.sell_products) {
        if (sell_product.units_quantity) {
            sellProductsUnits += sell_product.units_quantity;
        }
    }
    return sellProductsUnits;
}

export default calcSellProductsUnits