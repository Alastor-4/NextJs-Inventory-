"use client"

import React, { useEffect, useState } from "react";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import { AddOutlined, ArrowLeft, ChangeCircleOutlined, DeleteOutline } from "@mui/icons-material";
import { TableNoData } from "@/components/TableNoData";
import ownerUsers from "../requests/ownerUsers";
import { roles, users } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface WorkersMainTableProps {
    roles: roles[];
    userId?: number;
}

export default function WorkersMainTable({ roles, userId }: WorkersMainTableProps) {

    const router = useRouter();
    const [dataWorkers, setDataWorkers] = useState<(users & { roles: roles })[] | null>(null);

    //GET initial workers data
    useEffect(() => {
        const getData = async () => {
            const newDataWorkers: (users & { roles: roles })[] = await ownerUsers.allWorkers(userId);
            setDataWorkers(newDataWorkers);
        }
        getData();
    }, [userId]);

    const refreshAfterAction = async () => {
        const newDataWorkers: (users & { roles: roles })[] = await ownerUsers.allWorkers(userId);
        setDataWorkers(newDataWorkers);
        setSelectedWorker(null);
    }

    //SELECT worker in table
    const [selectedWorker, setSelectedWorker] = React.useState<users | null>(null);
    const handleSelectItem = (worker: users) => {
        if (selectedWorker && (selectedWorker.id === worker.id)) {
            setSelectedWorker(null);
        } else {
            setSelectedWorker(worker);
        }
    }

    //CHANGE Role Dialog
    const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

    const handleClickOpenDialog = () => setIsOpenDialog(true);

    const ChangeRoleDialog = () => {

        const [selectedRole, setSelectedRole] = useState<string>(`${selectedWorker?.role_id!}`);

        const handleChange = (event: SelectChangeEvent<typeof selectedRole>) => {
            setSelectedRole(event.target.value!);
        };

        const handleClose = () => setIsOpenDialog(false);

        const handleApplyRole = async () => {
            const response = await ownerUsers.changeRol(selectedWorker?.id, +selectedRole);
            if (response) await refreshAfterAction();
            handleClose()
        }

        return (
            <Dialog open={isOpenDialog} onClose={handleClose}>
                <DialogTitle>{`Cambiar rol de "${selectedWorker ? selectedWorker.username : ""}"`}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                            <InputLabel id="dialog-select-label">Rol</InputLabel>
                            <Select
                                labelId="dialog-select-label"
                                id="dialog-select-label"
                                value={selectedRole}
                                onChange={handleChange}
                                input={<OutlinedInput label="Rol" fullWidth />}
                                fullWidth
                            >
                                {roles.map((role: roles) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}
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

    const handleRemove = async () => {
        const response = await ownerUsers.deleteWorker(selectedWorker?.id);
        if (response) await refreshAfterAction();
    };

    const handleNavigateBack = () => router.push('/inventory');

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
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
                        Trabajadores
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        selectedWorker && (
                            <Box sx={{ display: "flex" }}>
                                <IconButton color={"inherit"} onClick={handleClickOpenDialog}>
                                    <ChangeCircleOutlined fontSize={"small"} />
                                </IconButton>

                                <IconButton color={"inherit"} onClick={handleRemove}>
                                    <DeleteOutline fontSize={"small"} />
                                </IconButton>

                                <Divider orientation="vertical" variant="middle" flexItem
                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />
                            </Box>
                        )
                    }

                    <Link href={`/inventory/owner/worker/create`}>
                        <IconButton color={"inherit"} sx={{ color: "white" }}>
                            <AddOutlined />
                        </IconButton>
                    </Link>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            {
                id: "username",
                label: "Usuario",
                align: "left"
            },
            {
                id: "name",
                label: "Nombre",
                align: "left"
            },
            {
                id: "mail",
                label: "Correo",
                align: "left"
            },
            {
                id: "phone",
                label: "Teléfono",
                align: "left"
            },
            {
                id: "role_id",
                label: "Role",
                align: "left"
            },
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
                            align={"left"}
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
        function getColorByRole(roleName: string) {
            switch (roleName) {
                case "admin":
                    return "primary"

                case "store_owner":
                    return "secondary"

                case "store_keeper":
                    return "error"

                case "store_seller":
                    return "success"

                default:
                    return "info"
            }
        }

        return (
            <TableBody>
                {dataWorkers?.map((worker) => (
                    <TableRow
                        key={worker.id}
                        hover
                        tabIndex={-1}
                        selected={!!selectedWorker && (worker.id === selectedWorker.id)}
                        onClick={() => handleSelectItem(worker)}
                    >
                        <TableCell>
                            <Checkbox size={"small"} checked={!!selectedWorker && (worker.id === selectedWorker.id)} />
                        </TableCell>
                        <TableCell>{worker.username}</TableCell>
                        <TableCell>{worker.name}</TableCell>
                        <TableCell>{worker.mail}</TableCell>
                        <TableCell>{worker.phone}</TableCell>
                        <TableCell>
                            {
                                worker.roles ? (
                                    <Chip
                                        size={"small"}
                                        label={worker.roles.name}
                                        color={getColorByRole(worker.roles.name!)}
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
            {/* Dialog */}
            <ChangeRoleDialog />

            <Card variant={"outlined"}>
                <CustomToolbar />
                <CardContent>
                    {
                        dataWorkers?.length! > 0
                            ?
                            (<TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                                <Table sx={{ width: "100%" }} size={"small"}>
                                    <TableHeader />
                                    <TableContent />
                                </Table>
                            </TableContainer>)
                            :
                            (<TableNoData />)
                    }
                </CardContent>
            </Card>
        </>
    )
}