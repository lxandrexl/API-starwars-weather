import 'reflect-metadata';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HttpMethods, FindRoute, type Route } from 'core';
import * as API from './src';

const routes: Route<APIGatewayProxyEvent, APIGatewayProxyResult>[] = [
  {
    path: '/auth/register',
    method: HttpMethods.POST,
    action: API.CreateUser,
  },
  {
    path: '/auth/challenge/new-password',
    method: HttpMethods.POST,
    action: API.ChallengeNewPassword,
  },
  {
    path: '/auth/challenge/mfa',
    method: HttpMethods.POST,
    action: API.ChallengeMFA,
  },
  {
    path: '/auth/login',
    method: HttpMethods.POST,
    action: API.AuthLogin,
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
