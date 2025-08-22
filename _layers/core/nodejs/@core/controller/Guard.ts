import {Guard} from './container-controller'

export function ValidateMethod(methods : string[]) : Guard{
    return async (event : any) => {
        const method = event.httpMethod;
        let initialObj: {
            pass: boolean,
            status: number,
            data: null | {
                error: {
                    code: string,
                    httpStatus: number,
                    message: string,
                    details: string
                },
                payload: null
            }
        } = {
            pass: true,
            status: 200,
            data: null
        }
        const findMethod = methods.some(element => element.toUpperCase() === method);
        if(!findMethod){
            initialObj.pass = false;
            initialObj.status = 501;
            initialObj.data = {
                error: {
                    code: "NOT_IMPLEMENTED",
                    httpStatus: 501,
                    message: "Método no implementado",
                    details: ""
                },
                payload: null
            };
        }
        return initialObj;
    }
}