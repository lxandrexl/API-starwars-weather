import 'reflect-metadata';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ContainerController, InputProcess, ValidateMethod} from 'core';
import { StatusCodes } from 'http-status-codes'
import { Container, Types } from '../../config';

export const Almacenados = async(event : APIGatewayEvent): Promise<APIGatewayProxyResult> =>{
    const container = new ContainerController()
                        .setInputMethod(InputProcess.BODY)
                        .setStatus(StatusCodes.OK)
                        .setGuard([ValidateMethod(['POST'])])
                        .setContainerIoC(
                            Container,
                            Types.AlmacenadosUseCaseApp
                        )
    return await container.call(event);
}