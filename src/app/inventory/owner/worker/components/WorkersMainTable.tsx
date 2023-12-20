//@ts-nocheck
"use client"

import React from "react";
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
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, ChangeCircleOutlined, DeleteOutline } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ownerUsers from "../requests/ownerUsers";

export default function WorkersMainTable(props) {
    const { roles, userId } = props

    const [data, setData] = React.useState(null)

    const router = useRouter()

    //get initial data
    React.useEffect(() => {
        const getData = async () => {
            const newData = await ownerUsers.allWorkers(userId)
            setData(newData)
        }
        getData();

    }, [userId])

    //table selected item
    const [selected, setSelected] = React.useState(null)
    const handleSelectItem = (item) => {
        if (selected && (selected.id === item.id)) {
            setSelected(null)
        } else {
            setSelected(item)
        }
    }

    //change role dialog
    const [openDialog, setOpenDialog] = React.useState(false);

    const handleClickOpenDialog = () => {
        setOpenDialog(true);
    };

    function ChangeRoleDialog(props) {
        const { open, setOpen, selected, setData, setSelected } = props

        const [selectedRole, setSelectedRole] = React.useState<number | string>('');

        const handleChange = (event: SelectChangeEvent<typeof selectedRole>) => {
            setSelectedRole(event.target.value || '');
        };

        const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
            setOpen(false);
        };

        const handleApplyRole = async () => {
            const response = await ownerUsers.changeRol(selected.id, selectedRole.id)
            if (response) {
                const allUsers = await ownerUsers.allWorkers(userId)
                if (allUsers) setData(allUsers)

                setSelected(null)
                setOpen(false)
            }
        }

        return (
            <Dialog open={open} onClose={handleClose}>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <DialogTitle>Cambiar role a "{selected ? selected.username : ""}"</DialogTitle>
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
                                {
                                    roles.map(item => (
                                        <MenuItem key={item.id} value={item}>{item.name}</MenuItem>
                                    ))
                                }
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

    async function handleRemove() {
        const response = await ownerUsers.deleteWorker(selected.id)
        if (response) {
            const allUsers = await ownerUsers.allWorkers(userId)
            if (allUsers) setData(allUsers)
            setSelected(null)
        }
    }

    function handleNavigateBack() {
        router.push(`/inventory`)
    }

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
                        Trabajadores
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        selected && (
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

                    <Link href={`/inventory/worker/create`}>
                        <IconButton color={"inherit"}>
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
        function getColorByRole(roleName) {
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
                {data.map(row => (
                    <TableRow
                        key={row.id}
                        hover
                        tabIndex={-1}
                        selected={selected && (row.id === selected.id)}
                        onClick={() => handleSelectItem(row)}
                    >
                        <TableCell>
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)} />
                        </TableCell>
                        <TableCell>
                            {row.username}
                        </TableCell>
                        <TableCell>
                            {row.name}
                        </TableCell>
                        <TableCell>
                            {row.mail}
                        </TableCell>
                        <TableCell>
                            {row.phone}
                        </TableCell>
                        <TableCell>
                            {
                                row.roles ? (
                                    <Chip
                                        size={"small"}
                                        label={row.roles.name}
                                        color={getColorByRole(row.roles.name)}
                                        sx={{ border: "1px solid lightGreen" }}
                                    />
                                ) : "-"
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <>
            <ChangeRoleDialog
                open={openDialog}
                setOpen={setOpenDialog}
                setData={setData}
                selected={selected}
                setSelected={setSelected}
            />

            <Card variant={"outlined"}>
                <CustomToolbar />

                <CardContent>
                    {
                        data?.length > 0
                            ? (
                                <Table sx={{ width: "100%" }} size={"small"}>
                                    <TableHeader />

                                    <TableContent />
                                </Table>
                            ) : (
                                <TableNoData />
                            )
                    }
                </CardContent>
            </Card>
        </>
    )
}