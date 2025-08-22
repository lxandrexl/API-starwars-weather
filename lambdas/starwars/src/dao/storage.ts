import { injectable } from 'inversify';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { IStorageDAO } from '../utils/interfaces';
import { ddbDoc } from 'core';

@injectable()
export class StorageDAO implements IStorageDAO {
  private ddb = ddbDoc;
  private fusionTable = process.env.FUSION_TABLE!;
  private almacenadosTable = process.env.ALMACENADOS_TABLE!;
  private idx   = 'PlanetIdIndex';
  
  async putHistory(payload: any) {
    await this.ddb.send(new PutCommand({
      TableName: this.almacenadosTable,
      Item: payload,
    }));
  }

  async putFusion(planetId: number,data: any, ttlSeconds: number) {
    const ttl = Math.floor(Date.now() / 1000) + ttlSeconds;
    const ts = Date.now();
    const item: any = { pk: 'fusion', sk: ts, planetId, payload: data, ttl };
    await this.ddb.send(new PutCommand({ TableName: this.fusionTable, Item: item }));
  }

  async getFusionByPlanet(planetId: number) {
    const r = await this.ddb.send(new QueryCommand({
      TableName: this.fusionTable,
      IndexName: this.idx,
      KeyConditionExpression: 'planetId = :pid',
      ExpressionAttributeValues: { ':pid': planetId },
      ScanIndexForward: false, 
      Limit: 1,
    }));
    return r.Items?.[0] ?? null;
  }

  async listFusion(limit = 10, nextKey?: { pk: string; sk: number }) {
    const r = await this.ddb.send(new QueryCommand({
      TableName: this.fusionTable,
      KeyConditionExpression: 'pk = :p',
      ExpressionAttributeValues: { ':p': 'fusion' },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: nextKey as any,
    }));
    return { items: r.Items ?? [], nextKey: r.LastEvaluatedKey as any };
  }

}
