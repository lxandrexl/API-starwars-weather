export interface IAuthDAO{
    login(payload : Login) : Promise<LoginResult>;
    createUser(payload: Login): Promise<any>;
    respondNewPassword(p: ChallengeNewPassword): Promise<LoginResult>;
    respondMfa(p: ChallengeMfa): Promise<LoginResult>;
}

export type Login = { email: string, password: string }

export type CognitoAuthOk = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
};

export type CognitoChallenge = {
  challenge: string;
  session?: string;
  parameters?: Record<string, any>;
};

export type LoginResult = { ok: true; data: CognitoAuthOk } | { ok: false; data: CognitoChallenge };

export type ChallengeNewPassword = {
  username: string;       
  newPassword: string;  
  session: string;   
};

export type ChallengeMfa = {
  username: string;
  code: string;          
  session: string;   
  type?: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA';  
};
