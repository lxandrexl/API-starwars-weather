import { captureAWSv3Client } from 'aws-xray-sdk-core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const ddb = captureAWSv3Client(new DynamoDBClient({}));
export const ddbDoc = DynamoDBDocumentClient.from(ddb, {
  marshallOptions: { removeUndefinedValues: true },
});

export const cognito = captureAWSv3Client(new CognitoIdentityProviderClient({}));
