'use client'
import { allProductsByDepartmentProps } from '@/types/interfaces';
import { FilterAlt, FilterAltOff } from '@mui/icons-material';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";

interface FilterProductsByDepartmentsModalProps {
    allProductsByDepartment: allProductsByDepartmentProps[];
    setAllProductsByDepartment: (allProductsByDepartmentProps: allProductsByDepartmentProps[] | null) => void;
    setFiltersApplied: (val: boolean) => void;
    toggleModalFilter: () => void;
    isFilterModalOpen: boolean;
}

const FilterProductsByDepartmentsModal = (
    { allProductsByDepartment, setAllProductsByDepartment, setFiltersApplied, toggleModalFilter, isFilterModalOpen }
        : FilterProductsByDepartmentsModalProps) => {

    const [filteredDepartments, setFilteredDepartments] = useState<any[] | null>(null);

    useEffect(() => {
        if (allProductsByDepartment) {
            const departmentsCopy = allProductsByDepartment.map(item => (
                { id: item.id, name: item.name, selected: item.selected }
            ))

            setFilteredDepartments(departmentsCopy);
        }
    }, [allProductsByDepartment]);

    const handleRemoveFilter = () => handleDepartmentClick(null, true);

    const handleCloseModal = () => {
        toggleModalFilter();
    }

    const applyFilters = () => {
        let existFilterApplied = false

        const newAllProductsByDepartment = allProductsByDepartment.map((item: any, index: number) => {
            const currentFilterApplied = filteredDepartments![index].selected

            if (currentFilterApplied) existFilterApplied = true

            return { ...item, selected: currentFilterApplied }
        })

        setAllProductsByDepartment(newAllProductsByDepartment);
        setFiltersApplied(existFilterApplied)
        toggleModalFilter();
    }

    const handleDepartmentClick = (departmentSelected: allProductsByDepartmentProps | null, remove?: boolean) => {
        if (!filteredDepartments) return;
        let departments = [...filteredDepartments]
        if (remove) {
            departments?.forEach((department: allProductsByDepartmentProps) => department.selected = false);
            setFilteredDepartments(departments);
        }
        else {
            departments?.forEach((department: allProductsByDepartmentProps) => {
                if (department.id === departmentSelected?.id) {
                    department.selected = !department.selected;
                }
            });
            setFilteredDepartments(departments);
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
                Filtrar por departamentos

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
                    {filteredDepartments?.map((department: allProductsByDepartmentProps) => (
                        <Chip
                            key={department.id!}
                            label={department.name}
                            clickable={true}
                            onClick={() => handleDepartmentClick(department)}
                            variant={department.selected ? "filled" : "outlined"}
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

export default FilterProductsByDepartmentsModal