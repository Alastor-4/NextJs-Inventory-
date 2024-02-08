import { sellsWithSellProducts } from "@/types/interfaces";

const calcReturnedQuantity = (sells: sellsWithSellProducts): number => {
    let returnedQuantity = 0;
    for (const sell_product of sells.sell_products) {
        if (sell_product.units_returned_quantity) {
            returnedQuantity += sell_product.units_returned_quantity;
        }
    }
    return returnedQuantity;
}

export default calcReturnedQuantity