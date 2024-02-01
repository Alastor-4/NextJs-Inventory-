"use client"

import { ChangeRolesDialogProps } from '@/types/interfaces';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent
} from '@mui/material';
import React, { useState } from 'react';
import users from '../../requests/users';
import { getRoleTranslation } from '@/utils/getRoleTranslation';

const ChangeRoleDialog = ({ open, setOpen, dataUsers, setDataUsers, roles, selectedUser, setSelectedUser }: ChangeRolesDialogProps) => {
    // const [selectedRole, setSelectedRole] = useState<string | null>('');

    // const handleChange = (event: SelectChangeEvent<typeof selectedRole>) => {
    //     setSelectedRole(event.target.value || '');
    // };
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

    const handleClose = () => {
        setOpen(false);
    };

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
                setOpen(false);
            }
        }
    }
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{`Cambiar role a "${selectedUser ? selectedUser.username : ""}"`}</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
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

                            {/* {
                                roles?.map(role => (
                                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                                ))
                            } */}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button color={"primary"} disabled={!selectedRole} onClick={handleApplyRole}>Cambiar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default ChangeRoleDialog