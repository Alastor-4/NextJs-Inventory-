"use client"

import {
    AppBar, Box, Card, CardContent, Checkbox, Chip, Divider,
    IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Toolbar, Typography
} from "@mui/material";
import { AddOutlined, ArrowLeft, ChangeCircleOutlined, DeleteOutline } from "@mui/icons-material";
import ChangeRoleWorkerModal from "./Modal/ChangeRoleWorkerModal";
import { getRoleTranslation } from '@/utils/getRoleTranslation';
import { getColorByRole } from "@/utils/getColorbyRole";
import { TableNoData } from "@/components/TableNoData";
import React, { useEffect, useState } from "react";
import { userWithRole } from "@/types/interfaces";
import ownerUsers from "../requests/ownerUsers";
import { useRouter } from "next/navigation";
import { roles } from "@prisma/client";
import Link from "next/link";

interface WorkersMainTableProps {
    roles: roles[];
    userId?: number;
}

const WorkersMainTable = ({ roles, userId }: WorkersMainTableProps) => {

    const router = useRouter();
    const [dataWorkers, setDataWorkers] = useState<userWithRole[] | null>(null);

    //GET initial workers data
    useEffect(() => {
        const getData = async () => {
            const newDataWorkers: userWithRole[] | null = await ownerUsers.allWorkers(userId);
            setDataWorkers(newDataWorkers);
        }
        getData();
    }, [userId]);

    //SELECT worker in table
    const [selectedWorker, setSelectedWorker] = useState<userWithRole | null>(null);
    const handleSelectWorker = (worker: userWithRole) => {
        if (selectedWorker && (selectedWorker.id === worker.id)) {
            setSelectedWorker(null);
        } else {
            setSelectedWorker(worker);
        }
    }

    const refreshAfterAction = async () => {
        const newDataWorkers: userWithRole[] | null = await ownerUsers.allWorkers(userId);
        setDataWorkers(newDataWorkers);
        setSelectedWorker(null);
    }

    //CHANGE Role Dialog
    const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

    const handleClickOpenDialog = () => setIsOpenDialog(true);

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
            { id: "username", label: "Usuario", },
            { id: "name", label: "Nombre", },
            { id: "mail", label: "Correo", },
            { id: "phone", label: "Teléfono", },
            { id: "role_id", label: "Rol", },
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
        return (
            <TableBody>
                {dataWorkers?.map((worker) => (
                    <TableRow
                        key={worker.id}
                        hover
                        tabIndex={-1}
                        selected={!!selectedWorker && (worker.id === selectedWorker.id)}
                        onClick={() => handleSelectWorker(worker)}
                    >
                        <TableCell>
                            <Checkbox size={"small"}
                                checked={!!selectedWorker && (worker.id === selectedWorker.id)} />
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
                                        label={getRoleTranslation(worker.roles.name!)}
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
            {isOpenDialog && <ChangeRoleWorkerModal
                open={isOpenDialog}
                setOpen={setIsOpenDialog}
                roles={roles}
                dataWorkers={dataWorkers}
                setDataWorkers={setDataWorkers}
                selectedWorker={selectedWorker}
                setSelectedWorker={setSelectedWorker}
            />}

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

export default WorkersMainTable