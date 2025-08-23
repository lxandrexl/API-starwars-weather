import { InvalidRequest, IUseCase, Request } from "core";
import { ReasonPhrases } from "http-status-codes";
import { inject, injectable } from "inversify";
import { IAuthDAO, Login } from "../../utils/interfaces";
import { Types } from "../../config";

@injectable()
export class CreateUserUseCase implements IUseCase<any, any> {
  constructor(@inject(Types.AuthDAO) private _authDAO: IAuthDAO) {}

  async execute(req: Request<Login>) {
    const { input } = req;
    if (!input || !input.email || !input.password) {
      throw new InvalidRequest(new Error("Faltan parámetros obligatorios"));
    }
    const result = await this._authDAO.createUser(input);
    return { status: ReasonPhrases.CREATED.toLowerCase(), details: result };
  }
}
