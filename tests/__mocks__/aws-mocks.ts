// tests/aws-mocks.ts
import { mockClient } from 'aws-sdk-client-mock';
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export const cognitoMock = mockClient(CognitoIdentityProviderClient);
export const ddbDocMock  = mockClient(DynamoDBDocumentClient);

export function resetAwsMocks() {
  cognitoMock.reset();
  ddbDocMock.reset();
}

// helpers de conveniencia
export function mockCreateUserOK() {
  cognitoMock.on(AdminCreateUserCommand).resolves({ User: { Username: 'u' } });
}
export function mockDdbPutOK() {
  ddbDocMock.on(PutCommand).resolves({});
}
