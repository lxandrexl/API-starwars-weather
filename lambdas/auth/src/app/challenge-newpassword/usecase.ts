import { IUseCase, Request } from 'core';
import { ReasonPhrases } from 'http-status-codes'
import { inject, injectable } from "inversify";
import { ChallengeNewPassword, IAuthDAO, Login, LoginResult } from '../../utils/interfaces';
import { Types } from '../../config';


@injectable()
export class ChallengeNewPasswordUseCase implements IUseCase<any, any>{

    constructor(
        @inject(Types.AuthDAO) private _authDAO : IAuthDAO,
    ){}
    
    async execute(req: Request<ChallengeNewPassword>) {
        try {
            const { input } = req;
            const result: LoginResult = await this._authDAO.respondNewPassword(input);
            return { status: ReasonPhrases.OK.toLowerCase(), details: result };
        } catch (error) {
            throw (error)
        }
    }

}