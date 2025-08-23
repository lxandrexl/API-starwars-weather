import { makeApiEvent } from "../../../../../tests/factories/api-event";
import { ChallengeNewPassword } from "./handler";
jest.mock("core/xray-bootstrap", () => ({}), { virtual: true });

const respondNewPassword = jest.fn();
jest.mock("../../dao/auth", () => ({
  AuthDAO: jest.fn().mockImplementation(() => ({ respondNewPassword })),
}));

describe("ChallengeNewPassword", () => {
  beforeEach(() => {
    respondNewPassword.mockReset();
    respondNewPassword.mockResolvedValue({ accessToken: "at", idToken: "it" });
  });

  it("200: resuelve NEW_PASSWORD_REQUIRED", async () => {
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/challenge/new-password",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        session: "sess",
        username: "u@a.com",
        newPassword: "Xyz11234",
      }),
    });
    const res = await ChallengeNewPassword(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body.details.accessToken).toBe("at");
  });

  it("400: payload inválido", async () => {
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/challenge/new-password",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "u@a.com" }), // falta session/newPassword
    });
    const errorResponse = {
      error: {
        code: "INVR",
        httpStatus: 400,
        message: "Bad Request",
        details: ["Faltan parámetros obligatorios"],
      },
      payload: null,
    };
    const res = await ChallengeNewPassword(event);

    expect(res.statusCode).toBe(400);
    expect(res.body).toBe(JSON.stringify(errorResponse));
  });

  it("500: error de DAO", async () => {
    respondNewPassword.mockRejectedValue(new Error("boom"));
    const event = makeApiEvent({
      httpMethod: "POST",
      path: "/auth/challenge-newpassword",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        session: "s",
        username: "u@a.com",
        newPassword: "Xyz11234",
      }),
    });
    const errorResponse = {
      error: {
        code: "IE",
        httpStatus: 500,
        message: "Internal Server Error",
        details: ["boom"],
      },
      payload: null,
    };
    const res = await ChallengeNewPassword(event);

    expect(res.statusCode).toBe(500);
    expect(res.body).toBe(JSON.stringify(errorResponse));
  });
});
