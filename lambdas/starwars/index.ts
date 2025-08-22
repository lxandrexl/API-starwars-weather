import 'reflect-metadata';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HttpMethods, FindRoute, type Route } from 'core';
import * as API from './src';

const routes: Route<APIGatewayProxyEvent, APIGatewayProxyResult>[] = [
  {
    path: '/starwars/fusionados',
    method: HttpMethods.GET,
    action: API.Fusionados,
  },
  {
    path: '/starwars/almacenar',
    method: HttpMethods.POST,
    action: API.Almacenados,
  },
  {
    path: '/starwars/historial',
    method: HttpMethods.GET,
    action: API.Historial,
  },
];

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { path, httpMethod } = event;
  const route = FindRoute(routes, path, httpMethod, event.headers ?? {});

  if (!route) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'Ruta no encontrada' }),
    };
  }

  return route.action(event);
};
