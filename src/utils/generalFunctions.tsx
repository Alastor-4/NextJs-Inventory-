import dayjs from "dayjs";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import { Button } from "@mui/material";
import React from "react";

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

const actionClose = (snackbarId: number) => (<Button size={"small"} color={"inherit"} variant={"outlined"} onClick={() => closeSnackbar(snackbarId)}>Ok</Button>)

export const notifySuccess = (message: string) => enqueueSnackbar(message, { variant: "success" })

export const notifyError = (message: string, requireUserConfirm?: boolean) => requireUserConfirm
    // @ts-ignore
    ? enqueueSnackbar(message, { variant: "error", persist: true, action: actionClose })
    : enqueueSnackbar(message, { variant: "error", autoHideDuration: 6000 })

export const notifyWarning = (message: string, requireUserConfirm?: boolean) => requireUserConfirm
    // @ts-ignore
    ? enqueueSnackbar(message, {variant: "warning", persist: true, action: actionClose})
    : enqueueSnackbar(message, {variant: "warning", autoHideDuration: 6000})

//return offer price per unit from first applicable offer found. return false if no applicable offer found
function evaluateOffers(offerItems: any[], itemsQuantity: number): number | false {
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

    if (foundApplicableOfferIndex > -1)
        return offerItems[foundApplicableOfferIndex].price_per_unit

    return false
}

//compute price per unit using offers (if exist and apply some) and discount if exist
export function computeDepotPricePerUnit(storeDepotWithOffersRelation: any, unitsQuantity: number): number {
    const productOffers = storeDepotWithOffersRelation.product_offers
    const productHasOffers = !!productOffers.length

    const offersEvaluation = productHasOffers
        ? evaluateOffers(productOffers, unitsQuantity)
        : false

    //final price method: If product has offers and unitsQuantity apply to one of them, final price is taken from
    //fulfilled offer. If no applicable offer exist then final price es taken from product base price and discount if it exists
    return offersEvaluation
        ? offersEvaluation
        : storeDepotWithOffersRelation.price_discount_quantity
            ? storeDepotWithOffersRelation.sell_price - storeDepotWithOffersRelation.price_discount_quantity
            : storeDepotWithOffersRelation.price_discount_percentage
                ? storeDepotWithOffersRelation.sell_price - (storeDepotWithOffersRelation.price_discount_percentage * storeDepotWithOffersRelation.sell_price / 100)
                : storeDepotWithOffersRelation.sell_price
}

// transaction address
export const transactionToWarehouse: string = "1"
export const transactionToStore: string = "2"
