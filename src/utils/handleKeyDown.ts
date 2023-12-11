export const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^\d$/.test(event.key) && event.key !== "Backspace" && event.key !== "Delete") {
        event.preventDefault(); // Previene la inserción del carácter no permitido
    }
};