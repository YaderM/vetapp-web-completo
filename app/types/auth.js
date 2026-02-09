**
 * Interfaz base para un usuario, tal como se devuelve en el perfil o en la respuesta de autenticación.
 */
export interface Usuario {
    id: number;
    nombre: string;
    email: string;
}

/**
 * Interfaz para los datos que se envían en el cuerpo de la petición de LOGIN.
 */
export interface LoginData {
    email: string;
    password: string;
}

/**
 * Interfaz para los datos que se envían en el cuerpo de la petición de REGISTRO.
 * Extiende LoginData añadiendo el nombre.
 */
export interface RegisterData extends LoginData {
    nombre: string;
}

/**
 * Interfaz para la respuesta que devuelve la API (tanto en login como en register).
 */
export interface AuthResponse {
    token: string;
    // Ahora usamos la interfaz Usuario exportada
    usuario: Usuario; 
    message: string;
}
