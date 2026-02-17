import { NextResponse } from 'next/server';
// Importamos tu controlador de Express (el que ya tiene el db.js corregido)
const { login } = require('../../../../controllers/auth.controller'); 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Creamos un objeto 'res' falso para que el controlador de Express no falle
        let responseData: any = {};
        let responseStatus = 200;

        const res = {
            status: (code: number) => {
                responseStatus = code;
                return { json: (data: any) => { responseData = data } };
            },
            json: (data: any) => { responseData = data }
        };

        // Ejecutamos la lógica de tu controlador
        await login({ body }, res);

        return NextResponse.json(responseData, { status: responseStatus });

    } catch (error) {
        console.error("Error en el puente de login:", error);
        return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
    }
}