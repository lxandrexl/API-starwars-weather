import { Schema } from "joi";
import { IUseCase } from "./UseCase";
import { InternalError, UnprocessableEntityError } from "./exception";
import { Container } from "inversify";
import * as Qs from "qs";
import { logger } from "../utils/logger";

export enum InputProcess {
  BODY,
  QUERY,
  RAW,
  REQUEST_CTX,
  RECORDS,
  REQUEST,
}

export abstract class ContainerControllerExecutor {
  static executeValidator(input: any, schema: Schema) {
    if (typeof input === "string") input = JSON.parse(input);
    const { error } = schema.validate(input);
    console.error("ERROR CONTAINERCONTROLLEREXECUTOR::", error);
    if (error) throw new UnprocessableEntityError(error);
  }

  static executeInputMethod(input: any, option: InputProcess) {
    switch (option) {
      case InputProcess.BODY:
        return typeof input.body === "string"
          ? JSON.parse(input.body)
          : input.body;
      case InputProcess.QUERY:
        return Qs.parse(input.queryStringParameters);
      case InputProcess.RAW:
        input.body =
          typeof input.body === "string" ? JSON.parse(input.body) : input.body;
        return input;
      case InputProcess.REQUEST_CTX:
        return typeof input.requestContext === "string"
          ? JSON.parse(input.requestContext)
          : input.requestContext;
      case InputProcess.RECORDS:
        return input.Records;
      case InputProcess.REQUEST:
        return input;
    }
  }
}

export type GuardResponse = {
  pass: boolean,
  status: number,
  data: any
}
export type Guard = (event : any) => Promise<GuardResponse>;

export class ContainerController {
  private _validator: Schema | undefined;
  private _interceptor: any;
  private _status: number = 200;
  private _container: Container | undefined;
  private _symbol: any;
  private _inputMethod: InputProcess = InputProcess.BODY;
  private _path: string | undefined;
  private _responseBody: boolean = true;
  private _guards: Guard[] = [];

  setRemoveResponse() {
    this._responseBody = false;
    return this;
  }

  setValidator(schema: Schema) {
    this._validator = schema;
    return this;
  }

  setInterceptor(interceptor: (err: any) => Promise<void> | void) {
    this._interceptor = interceptor;
    return this;
  }

  setStatus(status: number) {
    this._status = status;
    return this;
  }

  setContainerIoC(container: Container, symbol: symbol) {
    this._container = container;
    this._symbol = symbol;
    return this;
  }

  setInputMethod(option: InputProcess) {
    this._inputMethod = option;
    return this;
  }

  setPath(path: string) {
    this._path = path;
    return this;
  }

  setGuard(guard : Guard[]){
    this._guards = [
      ...this._guards,
      ...guard
    ];
    return this;
  }

  async call(event: any) {
    const reqId = event.requestContext?.requestId;
    logger.info({ reqId, path: event.path, qs: event.queryStringParameters }, "request in");
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
    try {
      const input = event;
      let request = {} as any;
      let inputRequest = ContainerControllerExecutor.executeInputMethod(
        input,
        this._inputMethod
      );
      request.input = inputRequest;
      request.params = event.pathParameters ?? {};
      request.query = event.queryStringParameters ?? {};
      request.headers = event.headers ?? {};
      // Execute Guards
      for(const element of this._guards){
        const {data, pass, status} = await element(event);
        if(!pass){
          return {
            statusCode: status,
            headers: securityHeaders,
            body: JSON.stringify(data)
          }; 
        }
      }
      if (this._validator) {
        ContainerControllerExecutor.executeValidator(
          request.input,
          this._validator
        );
      }
      if (!this._container || !this._symbol) {
        throw new InternalError(new Error("Container or symbol is undefined"));
      }
      const instance = this._container.get<IUseCase<any, any>>(this._symbol);
      const result = await instance.execute(request);
      logger.info({ reqId, resultCount: 1 }, "request ok");

      if (this._responseBody) {
        return {
          statusCode: this._status,
          body: JSON.stringify(result),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            ...securityHeaders
          },
        };
      } else {
        return result;
      }
    } catch (e: any) {
      logger.error({ reqId, err: e?.message, stack: e?.stack }, "request error");
      const error = typeof e.render === "function" ? e.render() : null;
      if (this._interceptor) {
        return this._interceptor(error ?? e);
      } else if (error) {
        return {
          statusCode: error.code,
          body: JSON.stringify(error.body),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            ...securityHeaders
          },
        };
      } else {
        // console.log(e);
        const internalError = new InternalError(e).render();
        return {
          statusCode: internalError.code,
          body: JSON.stringify(internalError.body),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            ...securityHeaders
          },
        };
      }
    }
  }
}

export type Request<T, P = any, Q = any> = {
  params?: P;
  query?: Q;
  headers?: any;
  input: T;
};
