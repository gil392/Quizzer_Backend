import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import request, { Test as RequestTest } from "supertest";
import { createAuthConfig } from "../../authentication/config";
import { injectUserToRequest } from "../../authentication/middlewares";
import { generateTokens } from "../../authentication/utils";
import { DatabaseConfig } from "../../services/database/config";
import { Database } from "../../services/database/database";
import { createBasicApp } from "../../services/server/server";
import { createTestEnv } from "../../utils/tests/utils";
import { UsersDal } from "../dal";
import { createUsersRouter } from "../router";
import { loggedUser, otherUser } from "./mocks";
import { castUserToPublicUser, castUserToSearchUserResult } from "./utils";

describe("user router", () => {
  const config = createTestEnv();
  const authConfig = createAuthConfig(config);
  const databaseConfig: DatabaseConfig = {
    connectionString: config.DB_CONNECTION_STRING,
  };
  const database = new Database(databaseConfig);
  const { userModel } = database.getModels();
  const usersDal = new UsersDal(userModel);

  const authMiddleware = injectUserToRequest(config.AUTH_TOKEN_SECRET);
  const { accessToken } = generateTokens(authConfig, loggedUser._id.toString());
  const authHeader = "JWT ".concat(accessToken);
  const setAuthHeaderToRequest = (request: RequestTest) =>
    request.set("authorization", authHeader);

  const app = createBasicApp();
  app.use("/", createUsersRouter(authMiddleware, { usersDal }));

  beforeAll(async () => {
    await database.start();
  });
  afterAll(async () => {
    await database.stop();
  });

  beforeEach(async () => {
    await userModel.insertMany([loggedUser, otherUser]);
  });
  afterEach(async () => {
    await userModel.deleteMany();
  });

  describe("get logged user", () => {
    const requestLoggedUser = () => request(app).get("/me");

    test("not logged in user should get UNAUTHORIZED", async () => {
      const response = await requestLoggedUser();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    test("logged in user should get user public details", async () => {
      const response = await setAuthHeaderToRequest(requestLoggedUser());
      expect(response.body).toMatchObject(castUserToPublicUser(loggedUser));
    });
  });

  describe("search users", () => {
    const requestSearchUsers = (searchTerm?: string) =>
      request(app).get("/search").query({ searchTerm });

    test("users containing searchTerm should return", async () => {
      const response = await requestSearchUsers("logged");
      expect(response.body).toEqual([castUserToSearchUserResult(loggedUser)]);
      expect(response.body).not.toContainEqual(
        castUserToSearchUserResult(otherUser)
      );
    });
  });

  describe("create friend request", () => {
    const requestCreateFriendRequest = (user: string) =>
      request(app).post("/friend").send({ user });

    test("request friendship for not existig user should return BAD_REQUEST", async () => {
      const response = await setAuthHeaderToRequest(
        requestCreateFriendRequest(new Types.ObjectId().toString())
      );
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("not logged user should return UNAUTHORIZED", async () => {
      const response = await requestCreateFriendRequest(otherUser._id);
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    test("request friendship should add logged user to user pending friends", async () => {
      const response = await setAuthHeaderToRequest(
        requestCreateFriendRequest(otherUser._id)
      );

      expect(response.status).toBe(StatusCodes.CREATED);
      const user = await userModel.findById(otherUser._id).lean();
      expect(user?.friendRequests).toContain(loggedUser._id);
    });
  });

  describe("accept friend request", () => {
    const requestAcceptFriendRequest = (friendRequester: string) =>
      request(app)
        .put("/friend/answer")
        .send({ friendRequester, accepted: true });

    test("accepting friend request should add user to logged user friends", async () => {
      await usersDal.addFriendRequest(loggedUser._id, otherUser._id);
      const response = await setAuthHeaderToRequest(
        requestAcceptFriendRequest(otherUser._id)
      );

      expect(response.status).toBe(StatusCodes.OK);
      const loggedUserDoc = await usersDal.findById(loggedUser._id).lean();
      const otherUserDoc = await usersDal.findById(otherUser._id).lean();
      expect(loggedUserDoc?.friends).toContain(otherUser._id);
      expect(loggedUserDoc?.friendRequests).not.toContain(otherUser._id);
      expect(otherUserDoc?.friends).toContain(loggedUser._id);
    });

    test("accepting friend who is not pending friend should return BAD_REQUEST", async () => {
      const response = await setAuthHeaderToRequest(
        requestAcceptFriendRequest(otherUser._id)
      );
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe("decline friend request", () => {
    const requestDeclineFriendRequest = (friendRequester: string) =>
      request(app)
        .put("/friend/answer")
        .send({ friendRequester, accepted: false });

    test("decline friend request should remove user from logged user pending friends", async () => {
      await usersDal.addFriendRequest(loggedUser._id, otherUser._id);
      const response = await setAuthHeaderToRequest(
        requestDeclineFriendRequest(otherUser._id)
      );

      expect(response.status).toBe(StatusCodes.OK);
      const loggedUserDoc = await usersDal.findById(loggedUser._id).lean();
      const otherUserDoc = await usersDal.findById(otherUser._id).lean();
      expect(loggedUserDoc?.friends).not.toContain(otherUser._id);
      expect(loggedUserDoc?.friendRequests).not.toContain(otherUser._id);
      expect(otherUserDoc?.friends).not.toContain(loggedUser._id);
    });

    test("decline friend who is not pending friend should return BAD_REQUEST", async () => {
      const response = await setAuthHeaderToRequest(
        requestDeclineFriendRequest(otherUser._id)
      );
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe("messages", () => {
    const requestMessages = () => request(app).get("/messages");

    test("not implemented route", async () => {
      const response = await setAuthHeaderToRequest(requestMessages());
      expect(response.status).toBe(StatusCodes.NOT_IMPLEMENTED);
    });
  });
});
