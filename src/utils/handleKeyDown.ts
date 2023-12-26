export const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^\d$/.test(event.key) && event.key !== "Backspace" && event.key !== "Delete") {
        event.preventDefault(); // Previene la inserción del carácter no permitido
    }
};

export const handleKeyDownWithCommaOrDot = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    const key = event.key;

    // Permite 0-9, Backspace, Delete, coma, y punto solo si hay un número delante
    if (!/^\d$/.test(key) && key !== "Backspace" && key !== "Delete") {
        // Verifica si se está ingresando una coma o punto y si hay al menos un número antes de ellos
        if ((key === "," || key === ".") && value && /^\d/.test(value)) {
            const hasCommaOrDot = value.includes(",") || value.includes(".");
            if (hasCommaOrDot) {
                event.preventDefault(); // Previene la inserción adicional de coma o punto
            }
        } else {
            event.preventDefault(); // Previene la inserción del carácter no permitido
        }
    }
};