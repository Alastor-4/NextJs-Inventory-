const userProfileStyles = {
    leftFlex: {
        display: "flex",
        fontWeight: "600",
        justifyContent: "flex-end",
        width: 2/5
    },

    rightFlex: {
        display: "flex",
        width: 3/5
    },

    cardButton: {
        cursor: "pointer",
        width: "200px",

        "&:hover": {
            boxShadow: 4,
            border: "1px solid black"
        }
    },


}

export default userProfileStyles