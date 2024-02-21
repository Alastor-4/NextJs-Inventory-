import { sell_payment_methods } from "@prisma/client";
import { Typography } from "@mui/material";

const formatPaymentMethods = (paymentMethods: sell_payment_methods[]): JSX.Element[] => {
    const formattedMethods = paymentMethods.map(({ quantity, payment_method }) => {
        if (payment_method.includes("CUP")) {
            return { quantity, payment_method: payment_method.replace(/CUP/g, " CUP") };
        }
        return { quantity, payment_method };
    });

    return formattedMethods.map(({ quantity, payment_method }, index) => (
        <Typography sx={{ whiteSpace: "nowrap" }} key={index}>{quantity} {payment_method}</Typography>
    ));
};

export default formatPaymentMethods