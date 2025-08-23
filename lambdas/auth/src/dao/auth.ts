// lambdas/auth/src/dao/auth.ts
import { injectable } from "inversify";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  AdminCreateUserCommandInput,
  AdminCreateUserCommand,
  RespondToAuthChallengeCommand,
  RespondToAuthChallengeCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  ChallengeMfa,
  ChallengeNewPassword,
  IAuthDAO,
  Login,
  LoginResult,
} from "../utils/interfaces";
import { cognito } from "core"; // en DAO de Cognito

const { APP_REGION, USER_POOL_CLIENT_ID, USER_POOL_ID } = process.env;

@injectable()
export class AuthDAO implements IAuthDAO {
  private client = cognito as CognitoIdentityProviderClient;

  async login(payload: Login): Promise<LoginResult> {
    const input: InitiateAuthCommandInput = {
      AuthFlow: "USER_PASSWORD_AUTH", // SIN SRP, SIN SECRET
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: payload.email,
        PASSWORD: payload.password,
      },
    };

    const resp = await this.client.send(new InitiateAuthCommand(input));

    // Desafíos (MFA, NEW_PASSWORD_REQUIRED, etc.)
    if (resp.ChallengeName) {
      return {
        ok: false,
        data: {
          challenge: resp.ChallengeName,
          session: resp.Session,
          parameters: resp.ChallengeParameters,
        },
      };
    }

    // OK
    const a = resp.AuthenticationResult!;
    return {
      ok: true,
      data: {
        accessToken: a.AccessToken!,
        idToken: a.IdToken!,
        refreshToken: a.RefreshToken,
        expiresIn: a.ExpiresIn!,
        tokenType: a.TokenType!,
      },
    };
  }

  async createUser(payload: Login): Promise<any> {
    const input: AdminCreateUserCommandInput = {
      UserPoolId: USER_POOL_ID,
      Username: payload.email,
      UserAttributes: [
        { Name: "email", Value: payload.email },
        { Name: "email_verified", Value: "true" },
      ],
      TemporaryPassword: payload.password, // Cognito obliga a cambiarla en primer login
      MessageAction: "SUPPRESS", // opcional: no envía correo automático
    };

    const resp = await this.client.send(new AdminCreateUserCommand(input));
    return resp;
  }

  async respondNewPassword(p: ChallengeNewPassword): Promise<LoginResult> {
    const input: RespondToAuthChallengeCommandInput = {
      ClientId: USER_POOL_CLIENT_ID,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: p.session,
      ChallengeResponses: {
        USERNAME: p.username,
        NEW_PASSWORD: p.newPassword,
        // Si tu pool exige atributos extra, se envían como "userAttributes.<attr>"
        // 'userAttributes.family_name': 'Perez',
      },
    };
    const resp = await this.client.send(
      new RespondToAuthChallengeCommand(input)
    );
    if (resp.ChallengeName) {
      // Raro, pero podría encadenar a MFA
      return {
        ok: false,
        data: {
          challenge: resp.ChallengeName,
          session: resp.Session,
          parameters: resp.ChallengeParameters,
        },
      };
    }
    const a = resp.AuthenticationResult!;
    return {
      ok: true,
      data: {
        accessToken: a.AccessToken!,
        idToken: a.IdToken!,
        refreshToken: a.RefreshToken,
        expiresIn: a.ExpiresIn!,
        tokenType: a.TokenType!,
      },
    };
  }

  async respondMfa(p: ChallengeMfa): Promise<LoginResult> {
    const challenge = p.type ?? "SMS_MFA"; // default SMS
    const input: RespondToAuthChallengeCommandInput = {
      ClientId: USER_POOL_CLIENT_ID,
      ChallengeName: challenge,
      Session: p.session,
      ChallengeResponses: {
        USERNAME: p.username,
        ...(challenge === "SMS_MFA" && p.code ? { SMS_MFA_CODE: p.code } : {}),
        ...(challenge === "SOFTWARE_TOKEN_MFA" && p.code
          ? { SOFTWARE_TOKEN_MFA_CODE: p.code }
          : {}),
      },
    };
    const resp = await this.client.send(
      new RespondToAuthChallengeCommand(input)
    );
    if (resp.ChallengeName) {
      // Otro challenge (p.ej. TOTP después de SMS)
      return {
        ok: false,
        data: {
          challenge: resp.ChallengeName,
          session: resp.Session,
          parameters: resp.ChallengeParameters,
        },
      };
    }
    const a = resp.AuthenticationResult!;
    return {
      ok: true,
      data: {
        accessToken: a.AccessToken!,
        idToken: a.IdToken!,
        refreshToken: a.RefreshToken,
        expiresIn: a.ExpiresIn!,
        tokenType: a.TokenType!,
      },
    };
  }
}
