import { InvalidRequest, IUseCase, Request } from "core";
import { ReasonPhrases } from "http-status-codes";
import { inject, injectable } from "inversify";
import { IAuthDAO, Login, LoginResult } from "../../utils/interfaces";
import { Types } from "../../config";

@injectable()
export class LoginUserUseCase implements IUseCase<any, any> {
  constructor(@inject(Types.AuthDAO) private _authDAO: IAuthDAO) {}

  async execute(req: Request<Login>) {
    const { input } = req;
    if (!input || !input.email || !input.password) {
      throw new InvalidRequest(new Error("Faltan parámetros obligatorios"));
    }
    const result: LoginResult = await this._authDAO.login(input);
    return { status: ReasonPhrases.OK.toLowerCase(), details: result };
  }
}
