// lambdas/starwars/src/app/almacenados/TS usecase.ts
import { injectable, inject } from "inversify";
import { IUseCase, Request } from "core";
import { ReasonPhrases } from "http-status-codes";
import crypto from "node:crypto";
import { Types } from "../../config";
import { IStorageDAO } from "../../utils/interfaces";

type Body = {
  planetId: number;
  notes?: string;
};

@injectable()
export class AlmacenadosUseCase implements IUseCase<any, any> {
  constructor(@inject(Types.StorageDAO) private _storageDAO: IStorageDAO) {}

  async execute(req: Request<Body>) {
    const input = req.input;
    // Validación mínima
    if (
      !input ||
      typeof input.planetId !== "number" ||
      input.planetId < 1 ||
      input.planetId > 60
    ) {
      return {
        status: "bad_request",
        details: { message: "planetId debe ser número entre 1 y 60" },
      };
    }

    const item = {
      id: crypto.randomUUID(),
      planetId: input.planetId,
      notes: input.notes ?? null,
      createdAt: Date.now(),
    };

    await this._storageDAO.putHistory(item);

    return {
      status: ReasonPhrases.CREATED.toLowerCase(),
      details: { id: item.id },
    };
  }
}
