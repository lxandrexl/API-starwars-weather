import {
    StatusCodes,
    getReasonPhrase,
} from 'http-status-codes';

export type ResultError = {
    code: number,
    body: {
        error: {
            "code": string,
            "httpStatus": number,
            "message": string,
            "details": string[]
        },
        payload: null
    }
}

export abstract class ErrorBase extends Error{
    constructor(key : string){
        super(key);
    }
    abstract render() : ResultError;
}

export class InvalidRequest extends ErrorBase{

    constructor(private _error : Error){
        super(_error.message);
        Object.setPrototypeOf(this, InvalidRequest.prototype);
    }

    render(){
        return {
            code: StatusCodes.BAD_REQUEST,
            body: {
                error: {
                    "code": "INVR",
                    "httpStatus": StatusCodes.BAD_REQUEST,
                    "message": getReasonPhrase(StatusCodes.BAD_REQUEST),
                    "details": [this._error.message]
                },
                payload: null
            }
        }
    }

}

export class InternalError extends ErrorBase{

    constructor(private _error : Error){
        super(_error.message);
        Object.setPrototypeOf(this, InternalError.prototype);
    }

    render(){
        return {
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            body: {
                error: {
                    "code": "IE",
                    "httpStatus": StatusCodes.INTERNAL_SERVER_ERROR,
                    "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                    "details": [this._error.message]
                },
                payload: null
            }
        }
    }

}

export class UnprocessableEntityError extends ErrorBase{

    private _error : Error[];

    constructor(_error : Error[] | Error){
        super(getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY));
        this._error = _error instanceof Array ? _error : [_error];
        Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
    }

    render(){
        return {
            code: StatusCodes.BAD_REQUEST,
            body: {
                error: {
                    "code": "UPER",
                    "httpStatus": StatusCodes.BAD_REQUEST,
                    "message": getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY),
                    "details": this._error.map((err) => err.message)
                },
                payload: null
            }
        }
    }

}