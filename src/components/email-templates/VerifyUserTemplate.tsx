import * as React from "react";

interface EmailTemplateProps {
    link: string;
}

export const VerifyUserTemplate: React.FC<Readonly<EmailTemplateProps>> = ({link}) => (
    <div>
        <h1>Visite el siguiente link para verificar su correo</h1>

        <p>{link}</p>
    </div>
)