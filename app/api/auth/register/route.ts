import { NextResponse } from 'next/server';
// Importamos el controlador de Express
const { register } = require('../../../../controllers/auth.controller'); 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Creamos el objeto 'res' falso para capturar la respuesta del controlador
        let responseData: any = {};
        let responseStatus = 200;

        const res = {
            status: (code: number) => {
                responseStatus = code;
                return { json: (data: any) => { responseData = data } };
            },
            json: (data: any) => { responseData = data }
        };

        // Ejecutamos la lógica de registro de tu controlador
        // Nota: El controlador usa req.body, por eso pasamos { body }
        await register({ body }, res);

        return NextResponse.json(responseData, { status: responseStatus });

    } catch (error) {
        console.error("Error en el puente de registro:", error);
        return NextResponse.json({ message: "Error interno en el servidor de registro" }, { status: 500 });
    }
}