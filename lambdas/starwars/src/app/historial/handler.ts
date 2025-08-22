import 'reflect-metadata';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ContainerController, InputProcess, ValidateMethod} from 'core';
import { StatusCodes } from 'http-status-codes'
import { Container, Types } from '../../config';

export const Historial = async(event : APIGatewayEvent): Promise<APIGatewayProxyResult> =>{
    const container = new ContainerController()
                        .setInputMethod(InputProcess.QUERY)
                        .setStatus(StatusCodes.OK)
                        .setGuard([ValidateMethod(['GET'])])
                        .setContainerIoC(
                            Container,
                            Types.HistorialUseCaseApp
                        )
    return await container.call(event);
}