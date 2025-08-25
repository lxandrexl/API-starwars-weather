// core/aws/clients.ts
import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

const isOffline =
  process.env.IS_OFFLINE === "true" || process.env.NODE_ENV === "local";
const xrayDisabled = process.env.AWS_XRAY_SDK_DISABLED === "1";

function maybeCaptureV3<T>(client: T): T {
  // 👉 En offline o con XRAY deshabilitado, NO hacer nada.
  if (isOffline || xrayDisabled) return client;

  // En AWS real, sí capturamos
  // (lazy require para evitar side effects en local/tests)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { captureAWSv3Client } =
    require("aws-xray-sdk-core") as typeof import("aws-xray-sdk-core");
  return (captureAWSv3Client as unknown as <U>(c: U) => U)(client);
}

// Config común de clientes (usa creds y endpoint sólo en offline)
const dynamoBase = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: isOffline
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
      }
    : undefined,
  endpoint:
    isOffline && process.env.DDB_ENDPOINT
      ? process.env.DDB_ENDPOINT
      : undefined, // LocalStack opcional
});

export const ddb = maybeCaptureV3(dynamoBase);

export const ddbDoc = DynamoDBDocumentClient.from(ddb, {
  marshallOptions: { removeUndefinedValues: true },
});

const cognitoBase = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: isOffline
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
      }
    : undefined,
});
export const cognito = maybeCaptureV3(cognitoBase);
