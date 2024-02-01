"use client"

import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, IconButton, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent
} from '@mui/material';
import { getRoleTranslation } from '@/utils/getRoleTranslation';
import { ChangeRoleWorkerModalProps } from '@/types/interfaces';
import ownerUsers from '../../requests/ownerUsers';
import { Close } from '@mui/icons-material';
import React, { useState } from 'react';

const ChangeRoleWorkerModal = ({ open, setOpen, dataWorkers, setDataWorkers, roles, selectedWorker, setSelectedWorker }: ChangeRoleWorkerModalProps) => {

    const [selectedRole, setSelectedRole] = useState<{ roleCode: string, roleTranslation: string }>({
        roleCode: `${selectedWorker?.role_id ?? ""}`,
        roleTranslation: getRoleTranslation(`${selectedWorker?.role_id!}`)
    });

    const handleChange = (event: SelectChangeEvent<typeof selectedRole.roleCode>) => {
        setSelectedRole({
            roleCode: event.target.value!.toString(),
            roleTranslation: getRoleTranslation(event.target.value!.toString())
        });
    };

    const handleClose = () => setOpen(false);

    const handleApplyRole = async () => {
        const response = await ownerUsers.changeRol(selectedWorker?.id, +selectedRole.roleCode);

        if (response) {
            const updatedWorker = await ownerUsers.workerDetails(response.id);
            if (updatedWorker) {
                let newDataWorkers = [...dataWorkers!]
                const updatedItemIndex = newDataWorkers.findIndex(item => item.id === updatedWorker.id)
                newDataWorkers.splice(updatedItemIndex, 1, updatedWorker)
                setDataWorkers(newDataWorkers);
                setSelectedWorker(null);
                handleClose();
            }
        }

        if (response) await
            handleClose();
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                color={"white"}
                fontWeight={"400"}
                sx={{ bgcolor: '#1976d3' }}
            >
                {`Cambiar rol de "${selectedWorker ? selectedWorker.username : ""}"`}
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                    sx={{ marginLeft: "10px" }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', marginTop: "15px" }}>
                    <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                        <InputLabel id="dialog-select-label">Rol</InputLabel>
                        <Select
                            labelId="dialog-select-label"
                            id="dialog-select-label"
                            value={selectedRole.roleCode}
                            onChange={handleChange}
                            input={<OutlinedInput label="Rol" fullWidth />}
                            fullWidth
                        >
                            {roles?.map((role) => <MenuItem key={role.id} value={role.id}>{getRoleTranslation(role.name!)}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color="error" variant="outlined" onClick={handleClose}>Cancelar</Button>
                <Button color="primary" variant="outlined" disabled={!selectedRole} onClick={handleApplyRole} >Cambiar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChangeRoleWorkerModal