import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Collapse,
  Grid,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import requestWarehouse from '../request/requestWarehouse';
import { useParams } from 'next/navigation';
import { ExpandLessOutlined, ExpandMoreOutlined, VisibilityOutlined } from '@mui/icons-material';
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog';
import { TableNoData } from '@/components/TableNoData';
import { Formik } from 'formik';
import * as Yup from "yup"
function AddProductFromWharehouse(props: any) {
  const { dataStore, warehouseId } = props

  const params = useParams()

  const [dataDepotsWarehouses, setDataDepotsWharehouse] = useState<any>([]);
  const [dataProductsByDepartment, setDataProductsByDepartment] = useState<any>([])
  const [data, setData] = useState<any>([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState<any>("")
  const [selectedDepartments, setSelectedDepartments] = useState<any>([])
  const [selectedDepot, setSelectedDepot] = useState<any>();

  const [showDetails, setShowDetails] = useState('')

  const [activeFeedBackSuccess, setActiveFeedbackSuccess] = useState(false);
  const [activeFeedBackError, setActiveFeedbackError] = useState(false);


  const [openImageDialog, setOpenImageDialog] = useState(false)
  const [dialogImages, setDialogImages] = useState([]);

  // Obtener todos los datos para esta interfaz
  // Wharehouse -> depots -> storeDepots
  //                      -> products -> departments
  useEffect(() => {
    const getData = async () => {
      const newDataDepotsWarehouses = await requestWarehouse.getAllWarehousesWithTheirDepots(params.id, dataStore.id)
      setDataDepotsWharehouse(newDataDepotsWarehouses);
    }

    const getDataSpecificWarehouse = async () => {
      const newDataDepotsWarehouses = await requestWarehouse.getWarehouseWithTheirDepots(params.id, dataStore.id, warehouseId)
      setDataDepotsWharehouse(newDataDepotsWarehouses);
      setSelectedWarehouse(0);
    }

    if (dataDepotsWarehouses.length === 0) {
      if (warehouseId === null) getData()
      else getDataSpecificWarehouse();
    }
  }, [dataDepotsWarehouses, warehouseId])

  // Puede pasar que q se oculte el último depósito
  // existente de un departamento seleccionado,por lo
  //q se deseleccionada
  const verifyingSelectedDepartments = (departments: any) => {
    let oldSelectedDepartaments = new Map()

    selectedDepartments.forEach((ind: any) => {
      oldSelectedDepartaments.set(dataProductsByDepartment[ind].departmentName, true)
    })

    let cont = 0;
    let newSelectedDepartments: any = [];

    departments.forEach((elements: any, key: any) => {
      if (oldSelectedDepartaments.has(key)) {
        newSelectedDepartments.push(cont)
      }
      cont++;
    })

    setSelectedDepartments(newSelectedDepartments);

  }

  /*
   Al seleccionar un nuevo departamento se cargan los datos
   de dataProductsByDepartment q no es mas q todos los productos
   del almacen seleccionado q no esten en la tienda y en cada posicion
   hay un objeto 
   {
     departmentName: string
     depots: [] => depots -> product
   }
   para asi mantenerlos organizados por departamentos */
  useEffect(() => {
    if (selectedWarehouse !== "") {
      let departments = new Map();

      dataDepotsWarehouses[0].depots.forEach((depot: any) => {
        const nameDepartment = depot.products.departments.name;

        const newContent = !departments.has(nameDepartment) ? [] : departments.get(nameDepartment)

        departments.set(nameDepartment, [...newContent, depot])
      })

      let newDataProductsByDepartment: any = [];

      verifyingSelectedDepartments(departments)

      departments.forEach((depots: any, key: any) => {
        newDataProductsByDepartment.push({ departmentName: key, depots: depots })
      })

      setDataProductsByDepartment(newDataProductsByDepartment);
    }
  }, [selectedWarehouse, dataDepotsWarehouses])

  // Es q siempre este seleccionado el elemento deseado 
  // y q ninguna organizacion de elementos influya
  const verifyingSelectedDepot = (newData: any) => {
    if (selectedDepot !== undefined) {
      const depotId = data[selectedDepot].id;
      let newSelectedProducts = undefined;

      newData.forEach((element: any, index: any) => {
        if (element.id === depotId) newSelectedProducts = index
      })

      setSelectedDepot(newSelectedProducts)
    }

  }

  // AL seleccionar departamentos se va actulizando data la cual
  // almacena los datos de los productos de ese departamento
  useEffect(() => {

    let newData: any = [];

    selectedDepartments.forEach((element: any) => {
      newData = [...newData, ...dataProductsByDepartment[element].depots]
    })

    newData.sort((a: any, b: any) => {
      if (a.products.name < b.products.name) return -1;
      else return 1
    })

    verifyingSelectedDepot(newData)

    setData(newData);


  }, [selectedDepartments])

  const TableHeader = () => {
    const headCells = [
      {
        id: "name",
        label: "Nombre",
        align: "left"
      },
      {
        id: "store_units",
        label: "Unidades restantes",
        align: "left"
      },
      {
        id: "image",
        label: "Imagen",
        align: "left"
      },
      {
        id: "more_details",
        label: "",
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

  function handleOpenImagesDialog(images: any) {
    setDialogImages(images)
    setOpenImageDialog(true)
  }

  const TableContent = () => {
    return (
      <TableBody>
        {data.map(
          (row: any, index: any) => (
            <React.Fragment key={row.id}>
              <TableRow
                key={row.id}
                hover
                tabIndex={-1}
              >
                <TableCell>
                  <Checkbox
                    size='small'
                    checked={selectedDepot === index ? true : false}
                    onClick={() => setSelectedDepot(selectedDepot === index ? undefined : index)}
                  />
                </TableCell>

                <TableCell>
                  {row.products.name}
                  <br />
                  {
                    row.products.description && (
                      <small>
                        {` ${row.products.description}`}
                      </small>
                    )
                  }
                </TableCell>

                <TableCell>
                  {row.product_total_remaining_units}
                </TableCell>

                <TableCell>
                  {
                    row.products.images.length
                      ? (
                        <IconButton size='small' onClick={() => handleOpenImagesDialog(row.products.image)}>
                          <VisibilityOutlined color='primary' fontSize='small' />
                        </IconButton>
                      )
                      : "no"
                  }

                </TableCell>


                <TableCell style={{ padding: 0 }} colSpan={5}>
                  <Tooltip title={"Details"}>
                    <IconButton
                      size={"small"}
                      sx={{ m: "3px" }}
                      onClick={(e) => setShowDetails((showDetails !== row.id) ? row.id : '')}
                    >
                      {


                        (showDetails !== row.id)
                          ? <ExpandMoreOutlined />
                          : <ExpandLessOutlined />
                      }
                    </IconButton>
                  </Tooltip>
                </TableCell>

              </TableRow>

              <TableRow >

                <TableCell style={{ padding: 0 }} colSpan={5}>

                  {showDetails === row.id && (
                    <Collapse in={showDetails === row.id} timeout="auto" unmountOnExit>
                      <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                        <Grid item xs={12}>

                          <Typography variant="subtitle1" gutterBottom component="div">
                            Detalles:
                          </Typography>
                        </Grid>


                        <Grid container item spacing={1} xs={12}>
                          <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Nombre:</Grid>
                          <Grid item xs={true}>
                            {row.products.name}
                            {
                              row.products.description && (
                                <small>
                                  {` ${row.products.description}`}
                                </small>
                              )
                            }
                          </Grid>
                        </Grid>


                        <Grid container item spacing={1} xs={12}>
                          <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                          <Grid item xs={true}>
                            {row.products.departments.name}
                          </Grid>
                        </Grid>


                        <Grid container item spacing={1} xs={12}>
                          <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                          <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                            {row.products.characteristics.length > 0
                              ? row.products.characteristics.map((item: any) => (
                                <Grid
                                  key={item.id}
                                  sx={{
                                    display: "inline-flex",
                                    margin: "3px",
                                    backgroundColor: "rgba(170, 170, 170, 0.8)",
                                    padding: "2px 4px",
                                    borderRadius: "5px 2px 2px 2px",
                                    border: "1px solid rgba(130, 130, 130)",
                                    fontSize: 14,
                                  }}
                                >
                                  <Grid container item alignItems={"center"} sx={{ marginRight: "3px" }}>
                                    <Typography variant={"caption"}
                                      sx={{ color: "white", fontWeight: "600" }}>
                                      {item.name.toUpperCase()}
                                    </Typography>
                                  </Grid>
                                  <Grid container item alignItems={"center"}
                                    sx={{ color: "rgba(16,27,44,0.8)" }}>
                                    {item.value}
                                  </Grid>
                                </Grid>
                              )
                              ) : "-"
                            }
                          </Grid>
                        </Grid>


                        <Grid container item spacing={1} xs={12}>
                          <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Imágenes:</Grid>
                          <Grid item xs={true}>
                            {
                              row.products.images.length > 0
                                ? (
                                  <Box
                                    sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", color: "blue" }}
                                    onClick={() => handleOpenImagesDialog(row.images)}
                                  >
                                    {row.images.length}

                                    <VisibilityOutlined fontSize={"small"}
                                      sx={{ ml: "5px" }} />
                                  </Box>
                                ) : "no"
                            }
                          </Grid>
                        </Grid>


                        <Grid container item spacing={1} xs={12}>
                          <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades en el almacén:</Grid>
                          <Grid item xs={true}>
                            {row.product_total_remaining_units}
                          </Grid>
                        </Grid>

                      </Grid>
                    </Collapse>
                  )
                  }
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
      </TableBody>
    )
  }


  const setValidationschema = (
    Yup.object({

      units: Yup.number()
        .typeError("La cantidad debe ser numérica")
        .min(0, "No se admiten cantidades negativas")
        .max(data[selectedDepot ?? 0]?.product_total_remaining_units, "No existe esa cantidad en el almacen")
        .required("Ponga alguna unidad inicial")
    })
  )

  // Despues de agregar un producto a la tienda este se elimina de los datos aunque
  // aun permanace en la bd pero se oculta al usuario
  const hideDepotInWarehouse = () => {
    const ind: any = selectedDepot

    let newDataDepotsWarehouses = [...dataDepotsWarehouses];
    newDataDepotsWarehouses[selectedWarehouse].depots = newDataDepotsWarehouses[selectedWarehouse].depots.filter((element: any) => element.id !== data[ind].id)

    setDataDepotsWharehouse(newDataDepotsWarehouses)
    setSelectedDepot(undefined)
  }

  // Al agregar un producto se comprueba si existen datos de este dentro de la tienda:
  // si es asi solo se modifica las unidades
  // sino se agregan los datos al storeDepots
  //Nota: Las cantidades otorgadas a la tienda se descuentan del las unidades
  // restantes del producto
  const handleSubmit = async (values: any) => {
    const ind: any = selectedDepot
    const units = parseInt(values.units)

    let dataRequest;
    let request;

    if (data[ind].store_depots.length === 0) {

      dataRequest = {
        store_id: dataStore.id,
        depot_id: data[ind].id,
        product_units: units,
        product_remaining_units: units,
        seller_profit_percentage: dataStore.fixed_seller_profit_percentage,
        seller_profit_quantity: dataStore.fixed_seller_profit_quantity,
        is_active: true,
        offer_notes: null,
        price_discount_percentage: null,
        price_discount_quantity: null,
        sell_price: data[ind].products.buy_price,
        sell_price_unit: "CUP"
      }

      request = await requestWarehouse.addProductsStoreDepots(params.id, dataRequest);

    } else {

      const { id, store_id, depot_id, sell_price, sell_price_units, price_discount_percentage, price_discount_quantity, seller_profit_percentage, seller_profit_quantity, is_active } = data[ind].store_depots[0];
      const dataRequest = {
        id,
        store_id,
        depot_id,
        product_units: units,
        product_remaining_units: units,
        sell_price,
        sell_price_units,
        price_discount_percentage,
        price_discount_quantity,
        seller_profit_percentage,
        seller_profit_quantity,
        is_active,
      }

      request = await requestWarehouse.updateStoreDepots(params.id, dataRequest)
    }

    // Se comprueba q se halla echo la operacion en storeDepots
    // y se procede a quitar la cantidad deseada en depots
    if (request === 200) {

      const { id, product_id, warehouse_id, inserted_by_id, product_total_units, product_total_remaining_units } = data[ind];
      const dataRequest = {
        id,
        product_id,
        warehouse_id,
        inserted_by_id,
        product_total_units,
        product_total_remaining_units: (product_total_remaining_units - units)
      }
      request = await requestWarehouse.updateDepots(params.id, dataRequest)

      if (request === 200) {
        hideDepotInWarehouse() // ocultar deposito
        setSelectedDepot(undefined) // dejar de seleccionar el deposito
        values.units = 0; // reiniciar valor de cantidad inicial

        setActiveFeedbackSuccess(true);

      } else {
        //Error
      }

    } else {
      //Error
    }



  }

  return (
    <>
      <>

        <ImagesDisplayDialog
          dialogTitle={"Imágenes del producto"}
          open={openImageDialog}
          setOpen={setOpenImageDialog}
          images={dialogImages}
        />

        <Snackbar
          open={activeFeedBackSuccess}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          autoHideDuration={6000}
          onClose={() => setActiveFeedbackSuccess(false)}
        >
          <Alert severity="success" variant='filled' sx={{ width: '100%' }}>
            This is a success message!
          </Alert>
        </Snackbar>

      </>
      <Formik
        initialValues={{ units: 0 }}
        validationSchema={setValidationschema}
        onSubmit={handleSubmit}
      >
        {
          (formik: any) => (
            <form onSubmit={formik.handleSubmit} >

              <Stack justifyContent={"center"} rowGap={1} padding={1}>
                <TextField
                  fullWidth
                  name="selectedWarehouse"
                  label={"Selecciona un almacén"}
                  size='small'
                  select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  {
                    dataDepotsWarehouses.map((warehouse: any, index: any) => (
                      <MenuItem key={index} value={index} >{warehouse.name}</MenuItem>
                    ))
                  }
                </TextField>

                <TextField
                  fullWidth
                  name="selectedDepartmentss"
                  label={"Departamentos"}
                  size='small'
                  select
                  value={selectedDepartments}

                  SelectProps={{
                    multiple: true,
                    renderValue: (selected: any) => (
                      <Grid container gap={1}>
                        {
                          selected.map((ind: number) => (
                            <Grid item key={ind} >
                              <Chip label={dataProductsByDepartment[ind].departmentName} color='primary' variant='outlined' />
                            </Grid>
                          ))
                        }
                      </Grid>
                    )
                  }}

                  onChange={(e) => {
                    setSelectedDepartments(e.target.value)
                  }}
                >
                  {
                    dataProductsByDepartment.map((element: any, index: any) => (
                      <MenuItem key={index} value={index} >{element.departmentName}</MenuItem>
                    ))
                  }
                </TextField>

                <Grid container spacing={1} sx={{ marginTop: "5px" }} >

                  <Grid item xs={3} >
                    <TextField
                      name={"units"}
                      {...formik.getFieldProps("units")}
                      label={"Cantidad inicial"}
                      value={formik.values.units}
                      size={'small'}
                      disabled={selectedDepot !== undefined ? false : true}
                      error={formik.errors.units && formik.touched.units}
                      helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                    />
                  </Grid>

                  {
                    selectedDepot !== undefined
                      ? (
                        <Grid item alignSelf={"center"}>
                          <Button
                            variant='contained'
                            size='small'
                            type='submit'
                          >Agregar Producto</Button>
                        </Grid>
                      )
                      : ""
                  }


                </Grid>

                <Card variant='outlined' >
                  <Grid container>
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
                  </Grid>

                </Card>
              </Stack>

            </form>


          )
        }


      </Formik>


    </>
  )
}

export default AddProductFromWharehouse
