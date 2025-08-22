import { IUseCase, Request } from 'core';
import { ReasonPhrases } from 'http-status-codes'
import { inject, injectable } from "inversify";
import { IStorageDAO } from '../../utils/interfaces';
import { Types } from '../../config';

type Q = { limit?: string; nextPk?: string; nextSk?: string };

@injectable()
export class HistorialUseCase implements IUseCase<any, any>{
    constructor(
       @inject(Types.StorageDAO) private _storageDAO: IStorageDAO,
    ){}
    
    async execute(req: Request<any>) {
        try {
            const raw = Number(req.query?.limit);
            const limit = Number.isInteger(raw) ? Math.min(60, Math.max(1, raw)) : 10;
            const nextKey =
                req.query?.nextPk && req.query?.nextSk
                    ? { pk: String(req.query.nextPk), sk: Number(req.query.nextSk) }
                    : undefined;
            const { items, nextKey: nk } = await this._storageDAO.listFusion(limit, nextKey);

            const rows = (items ?? []).map((it: any) => ({
                ts: it.ts ?? it.sk,
                date: new Date(Number(it.ts ?? it.sk)).toISOString(),
                ...it.payload,            // lo que guardaste en putHistory({ planetId, data })
            }));

            return { 
                status: ReasonPhrases.OK.toLowerCase(), 
                details: { items: rows, nextPk: nk?.pk ?? null, nextSk: nk?.sk ?? null }
            };
        } catch (error) {
            throw (error)
        }
    }

}