'use client'
import { Button, Chip, Dialog, DialogActions, DialogTitle, Grid, IconButton, Stack } from '@mui/material';
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import { FilterAlt, FilterAltOff } from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';

interface FilterProductsByConditionsModalProps {
    setFiltersApplied: (val: boolean) => void;
    setFilteredConditions: (conditions: { label: string, name: string, value: boolean }[]) => void;
    toggleModalFilter: () => void;
    formik: any;
    isFilterModalOpen: boolean;
}

const FilterProductsByConditionsModal = (
    { setFiltersApplied, setFilteredConditions, toggleModalFilter, formik, isFilterModalOpen }
        : FilterProductsByConditionsModalProps) => {

    const {
        onSellFilter, inactiveFilter, retiredFilter, withOutPriceFilter, withDiscountFilter,
        withOffersFilter, withoutDisponibilityFilter, disponibilityLessThan10Filter, disponibilityLessThan20Filter
    } = formik.values;

    const filterConditionsList: { label: string, name: string, value: boolean }[] = useMemo(() => [
        { label: 'En venta', name: 'onSellFilter', value: onSellFilter },
        { label: 'Inactivo', name: 'inactiveFilter', value: inactiveFilter },
        { label: 'Retirado', name: 'retiredFilter', value: retiredFilter },
        { label: 'Sin precio', name: 'withOutPriceFilter', value: withOutPriceFilter },
        { label: 'Con descuento', name: 'withDiscountFilter', value: withDiscountFilter },
        { label: 'Con oferta', name: 'withOffersFilter', value: withOffersFilter },
        { label: 'Sin disponibilidad', name: 'withoutDisponibilityFilter', value: withoutDisponibilityFilter },
        { label: 'Con disponibilidad < 10', name: 'disponibilityLessThan10Filter', value: disponibilityLessThan10Filter },
        { label: 'Con disponibilidad < 20', name: 'disponibilityLessThan20Filter', value: disponibilityLessThan20Filter },
    ], [disponibilityLessThan10Filter, disponibilityLessThan20Filter,
        inactiveFilter, onSellFilter, retiredFilter, withDiscountFilter,
        withOffersFilter, withOutPriceFilter, withoutDisponibilityFilter]);

    const [filteredConditionsModalList, setFilteredConditionsModalList] = useState<{ label: string, name: string, value: boolean }[] | null>(null);

    useEffect(() => {
        if (filterConditionsList) {
            const conditionsCopy = filterConditionsList.map((condition) => (
                { label: condition.label, name: condition.name, value: condition.value }
            ))
            setFilteredConditionsModalList(conditionsCopy);
        }
    }, [formik, filterConditionsList]);

    const handleRemoveFilter = () => handleConditionClick(null, true);

    const handleCloseModal = () => {
        toggleModalFilter();
    }

    const applyFilters = () => {
        let existFilterApplied = false;

        const newConditionsListFiltered = filteredConditionsModalList?.map((condition, index: number) => {
            const currentFilterApplied = filteredConditionsModalList![index].value;

            if (currentFilterApplied) existFilterApplied = true;

            formik.setFieldValue(condition.name, condition.value);

            return { ...condition, value: currentFilterApplied }
        });

        setFiltersApplied(existFilterApplied);
        toggleModalFilter();
        setFilteredConditions(newConditionsListFiltered!)
    }

    const handleConditionClick = (condition: { label: string, name: string, value: boolean } | null, remove?: boolean) => {
        if (!filterConditionsList) return;
        let conditionsList = [...filterConditionsList];
        if (remove) {
            conditionsList?.forEach((listedCondition: { label: string, name: string, value: boolean }) => listedCondition.value = false);
            setFilteredConditionsModalList(conditionsList);
        }
        else {
            conditionsList?.forEach((listedCondition: { label: string, name: string, value: boolean }) => {
                if (listedCondition.name === condition?.name) {
                    condition.value = !condition.value;
                }
            });
            setFilteredConditionsModalList(conditionsList);
        }
    }

    return (
        <Dialog open={isFilterModalOpen} fullWidth onClose={handleCloseModal}>
            <DialogTitle
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                color={"white"}
                padding={{ xs: "10px" }}
                sx={{ bgcolor: '#1976d3' }}
            >
                Filtrar por condiciones
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleCloseModal}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Grid container padding={"10px"} borderBottom={"1px solid gray"}>
                <Stack spacing={"8px"} direction="row" useFlexGap flexWrap="wrap" >
                    {filterConditionsList?.map((condition) => (
                        <Chip
                            key={condition.name}
                            label={condition.label}
                            clickable={true}
                            onClick={() => handleConditionClick(condition)}
                            variant={condition.value ? "filled" : "outlined"}
                            sx={{ display: "flex" }}
                            color="primary"
                        />
                    ))}
                </Stack>
            </Grid>

            <DialogActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button startIcon={<FilterAltOff />} color="error" variant="outlined" onClick={handleRemoveFilter}>Limpiar</Button>
                <Button startIcon={<FilterAlt />} color="primary" variant="outlined" onClick={applyFilters}>Aplicar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default FilterProductsByConditionsModal