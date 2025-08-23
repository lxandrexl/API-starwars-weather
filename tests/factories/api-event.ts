// tests/factories/api-event.ts
import type { APIGatewayProxyEvent } from 'aws-lambda';

const baseEvent: APIGatewayProxyEvent = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '/',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  resource: '/',
  requestContext: {
    accountId: 'test',
    apiId: 'api',
    stage: 'dev',
    requestId: 'req',
    protocol: 'HTTP/1.1',
    httpMethod: 'GET',
    path: '/',
    resourceId: 'res',
    resourcePath: '/',
    requestTimeEpoch: Date.now(),
    authorizer: {},
    identity: {
      accessKey: null, accountId: null, apiKey: null, apiKeyId: null,
      caller: null, clientCert: null, cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null, cognitoIdentityId: null,
      cognitoIdentityPoolId: null, principalOrgId: null,
      sourceIp: '127.0.0.1', user: null, userAgent: 'jest', userArn: null,
    },
  },
};

export function makeApiEvent(
  over: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent {
  return {
    ...baseEvent,
    ...over,
    headers: { ...baseEvent.headers, ...(over.headers ?? {}) },
    multiValueHeaders: { ...baseEvent.multiValueHeaders, ...(over.multiValueHeaders ?? {}) },
    requestContext: {
      ...baseEvent.requestContext,
      ...(over.requestContext ?? {}),
      httpMethod: over.httpMethod ?? baseEvent.httpMethod,
      path: over.path ?? baseEvent.path,
      identity: {
        ...baseEvent.requestContext.identity,
        ...(over.requestContext?.identity ?? {}),
      },
    },
  };
}
