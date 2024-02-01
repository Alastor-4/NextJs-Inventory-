"use client";

import React, { useEffect, useState } from "react";
import {
    AppBar, Badge, Box, Card, CardContent, Checkbox, Chip, Divider,
    IconButton, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Toolbar, Tooltip, Typography
} from "@mui/material";
import {
    ArrowLeft, ChangeCircleOutlined, CreateNewFolderOutlined,
    Done, PauseOutlined, PersonOutlined, StartOutlined,
} from "@mui/icons-material";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import { UsersMainTableProps, userWithRole } from "@/types/interfaces";
import { getRoleTranslation } from "@/utils/getRoleTranslation";
import { getColorByRole } from "@/utils/getColorbyRole";
import { TableNoData } from "@/components/TableNoData";
import ChangeRoleModal from "./Modal/ChangeRoleModal";
import { useRouter } from "next/navigation";
import users from "../requests/users";

const UsersMainTable = ({ roles, userId }: UsersMainTableProps) => {

    const router = useRouter();

    const [dataUsers, setDataUsers] = useState<userWithRole[] | null>(null);

    //GET initial data
    useEffect(() => {
        const getAllUser = async () => {
            const newUsersData: userWithRole[] = await users.allUsers();
            setDataUsers(newUsersData);
        }
        if (!dataUsers) getAllUser();
    }, [dataUsers, userId]);

    //SELECT user in table
    const [selectedUser, setSelectedUser] = useState<userWithRole | null>(null);
    const handleSelectUser = (user: userWithRole) => {
        if (selectedUser && (selectedUser.id === user.id)) {
            setSelectedUser(null);
        } else {
            setSelectedUser(user);
        }
    }

    const handleCreateWarehouse = async () => {
        if (selectedUser?.roles && selectedUser?.roles.name === "store_owner") {
            const response = await users.createMainWarehouse(selectedUser.id);

            if (response) {
                notifySuccess("Almacén principal creado para el usuario");
            }
        } else {
            notifyError("El usuario seleccionado no tiene rol owner");
        }
    }

    //CHANGE role dialog
    const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

    const handleClickOpenDialog = () => setIsOpenDialog(true);

    const handleVerify = async () => {
        const response = await users.verifyUser(selectedUser?.id);
        if (response) {
            let newDataUsers = [...dataUsers!];
            const updatedItemIndex = newDataUsers.findIndex(user => user.id === response.id);
            newDataUsers[updatedItemIndex].is_verified = !newDataUsers[updatedItemIndex].is_verified;
            setDataUsers(newDataUsers);
            setSelectedUser(null);
        }
    }

    const handleToggleActive = async () => {
        const isActive = !selectedUser?.is_active
        const response = await users.toggleActivateUser(selectedUser?.id, isActive);
        if (response) {
            let newDataUsers = [...dataUsers!];
            const updatedItemIndex = newDataUsers.findIndex(user => user.id === response.id)
            newDataUsers[updatedItemIndex].is_active = !newDataUsers[updatedItemIndex].is_active;
            setDataUsers(newDataUsers);
            setSelectedUser(null);
        }
    }

    const handleNavigateBack = () => router.back();

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        Usuarios
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        selectedUser && (
                            <Box sx={{ display: "flex" }}>
                                {
                                    !selectedUser?.is_verified
                                    && (
                                        <IconButton color={"inherit"} onClick={handleVerify}>
                                            <Done fontSize={"small"} />
                                        </IconButton>
                                    )
                                }
                                <IconButton color={"inherit"} onClick={handleToggleActive}>
                                    {
                                        selectedUser?.is_active
                                            ? <PauseOutlined fontSize={"small"} />
                                            : <StartOutlined fontSize={"small"} />
                                    }
                                </IconButton>
                                <Divider orientation="vertical" variant="middle" flexItem
                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />
                                <IconButton color={"inherit"} onClick={handleClickOpenDialog}>
                                    <ChangeCircleOutlined fontSize={"small"} />
                                </IconButton>
                                <Divider orientation="vertical" variant="middle" flexItem
                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />
                                <IconButton color={"inherit"} onClick={handleCreateWarehouse}>
                                    <CreateNewFolderOutlined fontSize={"small"} />
                                </IconButton>
                            </Box>
                        )
                    }
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            { id: "username", label: "Usuario", },
            { id: "name", label: "Nombre", },
            { id: "mail", label: "Correo", },
            { id: "phone", label: "Teléfono", },
            { id: "role_id", label: "Role", },
        ]

        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        key={"checkbox"}
                        align={"left"}
                        padding={'checkbox'}
                    >
                    </TableCell>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"center"}
                            padding={'normal'}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {

        return (
            <TableBody>
                {dataUsers?.map((user: userWithRole) => (
                    <TableRow
                        key={user.id}
                        hover
                        tabIndex={-1}
                        selected={!!selectedUser && (user.id === selectedUser?.id)}
                        onClick={() => handleSelectUser(user)}
                    >
                        <TableCell>
                            <Checkbox
                                size={"small"} checked={!!selectedUser && (user.id === selectedUser?.id)}
                            />
                        </TableCell>
                        <TableCell>
                            <Tooltip title={`Usuario ${user.is_active ? 'activo' : 'inactivo'} (${user.roles?.name ?? "user"})`}>
                                <Badge
                                    color={user.is_active === true ? "success" : "error"}
                                    variant={"dot"}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                >
                                    <PersonOutlined fontSize={"small"} />
                                </Badge>
                            </Tooltip>
                            {
                                user.is_verified
                                    ? (<Box sx={{
                                        display: "inline-flex",
                                        p: "3px",
                                        my: "8px"
                                    }}>
                                        {user.username}
                                    </Box>)
                                    : (<Tooltip title={"Usuario no verificado"}>
                                        <Box sx={{
                                            display: "inline-flex",
                                            p: "3px",
                                            my: "8px",
                                            background: "red",
                                            color: "white",
                                            borderRadius: "3px"
                                        }}>
                                            {user.username}
                                        </Box>
                                    </Tooltip>)
                            }
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.mail}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                            {
                                user.roles ? (
                                    <Chip
                                        size={"small"}
                                        label={getRoleTranslation(user.roles.name!)}
                                        color={getColorByRole(user.roles.name!)}
                                        sx={{ border: "1px solid lightGreen" }}
                                    />) : "-"
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <>
            {isOpenDialog && <ChangeRoleModal
                open={isOpenDialog}
                setOpen={setIsOpenDialog}
                dataUsers={dataUsers}
                setDataUsers={setDataUsers}
                roles={roles}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />}
            <Card variant={"outlined"}>
                <CustomToolbar />

                <CardContent>
                    {
                        dataUsers?.length! > 0
                            ? (
                                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                                    <Table sx={{ width: "100%" }} size={"small"}>
                                        <TableHeader />
                                        <TableContent />
                                    </Table>
                                </TableContainer>
                            ) : (
                                <TableNoData />
                            )
                    }
                </CardContent>
            </Card>
        </>
    )
}

export default UsersMainTable