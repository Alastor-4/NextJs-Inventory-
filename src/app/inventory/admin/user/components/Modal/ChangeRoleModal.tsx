"use client"

import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, IconButton, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent
} from '@mui/material';
import { getRoleTranslation } from '@/utils/getRoleTranslation';
import { ChangeRoleModalProps } from '@/types/interfaces';
import React, { useState } from 'react';
import users from '../../requests/users';
import { Close } from '@mui/icons-material';

const ChangeRoleModal = ({ open, setOpen, dataUsers, setDataUsers, roles, selectedUser, setSelectedUser }: ChangeRoleModalProps) => {

    const [selectedRole, setSelectedRole] = useState<{ roleCode: string, roleTranslation: string }>({
        roleCode: `${selectedUser?.role_id ?? ""}`,
        roleTranslation: getRoleTranslation(`${selectedUser?.role_id!}`)
    });

    const handleChange = (event: SelectChangeEvent<typeof selectedRole.roleCode>) => {
        setSelectedRole({
            roleCode: event.target.value!.toString(),
            roleTranslation: getRoleTranslation(event.target.value!.toString())
        });
    };

    const handleClose = () => setOpen(false);

    const handleApplyRole = async () => {
        const response = await users.changeRol(selectedUser?.id, +selectedRole!.roleCode);

        if (response) {
            const updatedUser = await users.userDetails(response.id);
            if (updatedUser) {
                let newDataUsers = [...dataUsers!]
                const updatedItemIndex = newDataUsers.findIndex(item => item.id === updatedUser.id)
                newDataUsers.splice(updatedItemIndex, 1, updatedUser)
                setDataUsers(newDataUsers);
                setSelectedUser(null);
                handleClose();
            }
        }
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
                {`Cambiar rol de "${selectedUser ? selectedUser.username : ""}"`}
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

export default ChangeRoleModal