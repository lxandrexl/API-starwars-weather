import { makeApiEvent } from '../../../../../tests/factories/api-event';
import { CreateUser } from './handler';

jest.mock('core/xray-bootstrap', () => ({}), { virtual: true });

// Mocks específicos de este spec
jest.mock('../../dao/auth', () => ({
  AuthDAO: jest.fn().mockImplementation(() => ({
    createUser: jest.fn().mockResolvedValue({ User: { Username: 'u' } }),
  })),
}));

describe('CreateUserUseCase', () => {
  it('crea usuario en cognito', async () => {
    const event = makeApiEvent({
      httpMethod: 'POST',
      path: '/auth/register',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'Xyz11234' }),
    });
    const res = await CreateUser(event);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(JSON.stringify({ status: 'created', details: {User: { Username: 'u'}} }));
    //expect(dao.createUser).toHaveBeenCalledWith({ email: 'a@b.com', password: 'XyZ!1234' });
  });
});
