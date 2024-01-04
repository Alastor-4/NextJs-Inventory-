'use client'
import { allProductsByDepartmentProps } from '@/types/interfaces';
import { CheckBoxOutlineBlank, CheckBoxOutlined, FilterAltOff } from '@mui/icons-material';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface FilterProductsByDepartmentsModalProps {
    allProductsByDepartment: allProductsByDepartmentProps[] | null;
    setSelectedDepartments: (allProductsByDepartmentProps: allProductsByDepartmentProps[] | null) => void;
    toggleModalFilter: () => void;
    isFilterModalOpen: boolean;
}

const FilterProductsByDepartmentsModal = (
    { allProductsByDepartment, setSelectedDepartments, toggleModalFilter, isFilterModalOpen }
        : FilterProductsByDepartmentsModalProps) => {
    const [filteredDepartments, setFilteredDepartments] = useState<allProductsByDepartmentProps[] | null>(null);

    useEffect(() => {
        setFilteredDepartments(allProductsByDepartment);
    }, [allProductsByDepartment])


    const handleRemoveFilter = () => {
        handleDepartmentClick(null, true);
    }

    const handleAddFilter = () => {
        setSelectedDepartments(filteredDepartments);
        toggleModalFilter();
    };

    const handleDepartmentClick = (departmentSelected: allProductsByDepartmentProps | null, remove?: boolean) => {
        if (!filteredDepartments) return;
        let departments = [...filteredDepartments!];
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
        <Dialog open={isFilterModalOpen} fullWidth>
            <DialogTitle m="auto">Filtrar por departamentos</DialogTitle>
            <DialogContent dividers sx={{ marginX: "20px" }}>
                <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap flexWrap="wrap" >
                    {allProductsByDepartment?.map((department: allProductsByDepartmentProps) => (
                        <Chip
                            key={department.id!}
                            label={department.name}
                            clickable={true}
                            size="medium"
                            onClick={() => handleDepartmentClick(department)}
                            variant={department.selected ? "filled" : "outlined"}
                            sx={{ display: "flex" }}
                            icon={department.selected ? <CheckBoxOutlined /> : <CheckBoxOutlineBlank />}
                            color="primary"
                        />
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ marginRight: "15px" }}>
                <Button startIcon={<FilterAltOff />} color="error" variant="outlined" onClick={handleRemoveFilter}>Limpiar</Button>
                <Button color="primary" variant="outlined" onClick={handleAddFilter}>Aceptar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default FilterProductsByDepartmentsModal