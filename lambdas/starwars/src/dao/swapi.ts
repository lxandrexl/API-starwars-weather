import { injectable } from 'inversify';
import { ISwapiDAO, SwapiPlanet } from '../utils/interfaces';

@injectable()
export class SwapiDAO implements ISwapiDAO {
  private base = process.env.SWAPI_BASE_URL ?? 'https://swapi.info/api';

  async getPlanetById(id?: number): Promise<SwapiPlanet> {
    const res = await fetch(`${this.base}/planets/${id}`, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`SWAPI ${res.status}`);
    return res.json() as Promise<SwapiPlanet>;
  }
}
