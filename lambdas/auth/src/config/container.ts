import { IUseCase } from "core";
import { Container } from "inversify";
import { IAuthDAO } from "../utils//interfaces";
import { Types } from "./types";
import { AuthDAO } from "../dao/auth";
import { LoginUserUseCase } from "../app/login/usecase";
import { CreateUserUseCase } from "../app/create-user/usecase";
import { ChallengeMFAUseCase } from "../app/challenge-mfa/usecase";
import { ChallengeNewPasswordUseCase } from "../app/challenge-newpassword/usecase";

const container = new Container();
container.bind<IAuthDAO>(Types.AuthDAO).to(AuthDAO);
container.bind<IUseCase<any, any>>(Types.LoginUseCaseApp).to(LoginUserUseCase);
container.bind<IUseCase<any, any>>(Types.CreateUserUseCaseApp).to(CreateUserUseCase);
container.bind<IUseCase<any, any>>(Types.ChallengeNewPasswordUseCaseApp).to(ChallengeNewPasswordUseCase);
container.bind<IUseCase<any, any>>(Types.ChallengeMFAUseCaseApp).to(ChallengeMFAUseCase);

export { container as Container };