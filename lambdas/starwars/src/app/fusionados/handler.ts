import 'reflect-metadata';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ContainerController, InputProcess, ValidateMethod} from 'core';
import { StatusCodes } from 'http-status-codes'
import { Container, Types } from '../../config';

export const Fusionados = async(event : APIGatewayEvent): Promise<APIGatewayProxyResult> =>{
    const container = new ContainerController()
                        .setInputMethod(InputProcess.QUERY)
                        .setStatus(StatusCodes.OK)
                        .setGuard([ValidateMethod(['GET'])])
                        .setContainerIoC(
                            Container,
                            Types.FusionadosUseCaseApp
                        )
    return await container.call(event);
}