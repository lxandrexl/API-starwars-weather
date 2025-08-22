import { ValidateMethod } from '../controller/Guard';

export async function ValidateRouterMethod(event : any, methods : string[]){
    const {pass, status, data} = await ValidateMethod(methods)(event);
    if(!pass){
        return {
            pass: false,
            send: {
                statusCode: status,
                headers: {
                    'X-Content-Type-Options': 'nosniff',
                    'X-XSS-Protection': '1; mode=block',
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Referrer-Policy': 'no-referrer-when-downgrade',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                },
                body: JSON.stringify(data)
            }
        }
    }
    return {
        pass: true,
        send: null
    }
}