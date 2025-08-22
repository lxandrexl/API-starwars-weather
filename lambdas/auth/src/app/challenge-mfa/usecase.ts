import { IUseCase, Request } from 'core';
import { ReasonPhrases } from 'http-status-codes'
import { inject, injectable } from "inversify";
import { ChallengeMfa, IAuthDAO, LoginResult } from '../../utils/interfaces';
import { Types } from '../../config';


@injectable()
export class ChallengeMFAUseCase implements IUseCase<any, any>{

    constructor(
        @inject(Types.AuthDAO) private _authDAO : IAuthDAO,
    ){}
    
    async execute(req: Request<ChallengeMfa>) {
        try {
            const { input } = req;
            const result: LoginResult = await this._authDAO.respondMfa(input);
            return { status: ReasonPhrases.OK.toLowerCase(), details: result };
        } catch (error) {
            throw (error)
        }
    }

}