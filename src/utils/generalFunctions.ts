import dayjs from "dayjs";
import {enqueueSnackbar} from "notistack";

export const numberFormat = (number: string) => parseFloat((Math.round(parseFloat(number.toString()) * 100) / 100).toFixed(2))

export const dateFormat = (date: string, includeTime: boolean) => dayjs(date).format(includeTime ? "DD/MM/YYYY hh:mm A" : "DD/MM/YYYY")

export const daysMap = {
    1: "Domingo",
    2: "Lunes",
    3: "Martes",
    4: "Miércoles",
    5: "Jueves",
    6: "Viernes",
    7: "Sábado",
}

export const notifySuccess = (message: string) => enqueueSnackbar(message, {variant: "success"})
export const notifyError = (message: string) => enqueueSnackbar(message, {variant: "error"})
export const notifyWarning = (message: string) => enqueueSnackbar(message, {variant: "warning"})

//return offer price per unit from first applicable offer found. return false if no applicable offer found
export function evaluateOffers(offerItems: any[], itemsQuantity: number): number | false {
    const evaluate = (compareFunction: string, compareQuantity: number, itemsQuantity: number): boolean => {
        switch (compareFunction) {
            case "=":
                return itemsQuantity === compareQuantity

            case ">":
                return itemsQuantity > compareQuantity

            default:
                return false
        }
    }

    const foundApplicableOfferIndex = offerItems.findIndex(item => evaluate(item.compare_function, item.compare_units_quantity, itemsQuantity))

    if(foundApplicableOfferIndex > -1)
        return offerItems[foundApplicableOfferIndex].price_per_unit

    return false
}

//compute price per unit using offers (if exist and apply some) and discount if exist
export function computeDepotPricePerUnit(storeDepot: any, unitsQuantity: number): number {
    const productOffers = storeDepot.product_offers
    const productHasOffers = !!productOffers.length

    const offersEvaluation = productHasOffers
        ? evaluateOffers(productOffers, unitsQuantity)
        : false

    const pricePerUnitWithOffers = offersEvaluation ? offersEvaluation : storeDepot.sell_price

    return storeDepot.price_discount_quantity
        ? pricePerUnitWithOffers - storeDepot.price_discount_quantity
        : storeDepot.price_discount_percentage
            ? pricePerUnitWithOffers - (storeDepot.price_discount_percentage * pricePerUnitWithOffers / 100)
            : pricePerUnitWithOffers
}