import { makeApiEvent } from "../../../../../tests/factories/api-event";
import { CreateUser } from "./handler";
jest.mock("core/xray-bootstrap", () => ({}), { virtual: true });

const createUser = jest.fn();
jest.mock("../../dao/auth", () => ({
  AuthDAO: jest.fn().mockImplementation(() => ({ createUser })),
}));

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    createUser.mockReset();
    createUser.mockResolvedValue({ User: { Username: "u" } });
  });

  it("crea usuario en cognito", async () => {
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/register",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "Xyz11234" }),
    });
    const res = await CreateUser(event);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(
      JSON.stringify({
        status: "created",
        details: { User: { Username: "u" } },
      })
    );
    expect(createUser).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "Xyz11234",
    });
  });

  it("retorna error si el usuario ya existe", async () => {
    createUser.mockRejectedValueOnce(new Error("UserAlreadyExists"));
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/register",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "existe@b.com", password: "Xyz11234" }),
    });
    const res = await CreateUser(event);
    const errorResponse = {
      error: {
        code: "IE",
        httpStatus: 500,
        message: "Internal Server Error",
        details: ["UserAlreadyExists"],
      },
      payload: null,
    };

    expect(res.statusCode).toBe(500);
    expect(res.body).toBe(JSON.stringify(errorResponse));
  });

  it("retorna 501 si se usa un método HTTP no soportado", async () => {
    const event = makeApiEvent({
      httpMethod: "GET",
      path: "/auth/register",
      headers: {},
      body: null,
    });
    const res = await CreateUser(event);
    const errorResponse = {
      error: {
        code: "NOT_IMPLEMENTED",
        httpStatus: 501,
        message: "Método no implementado",
        details: "",
      },
      payload: null,
    };

    expect(res.statusCode).toBe(501);
    expect(res.body).toBe(JSON.stringify(errorResponse));
  });
});
