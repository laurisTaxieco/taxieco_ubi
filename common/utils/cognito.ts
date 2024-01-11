import AWS from "aws-sdk";
import {
  AdminInitiateAuthResponse,
  RespondToAuthChallengeResponse,
} from "aws-sdk/clients/cognitoidentityserviceprovider";
import { cookies } from "next/headers";
import { accessTokenCookie, idTokenCookie, refreshTokenCookie } from "../const";

export type Credentials = {
  username: FormDataEntryValue;
  password: FormDataEntryValue;
};

const authParams = {
  UserPoolId: process.env.COGNITO_USERPOOL!,
  ClientId: process.env.COGNITO_USERPOOL_CLIENT!,
};

export const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.REGION_AWS,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});

export async function getToken(type: "id" | "access" | "refresh") {
  const cookieStore = cookies();
  const idToken = cookieStore.get(idTokenCookie)?.value;
  const accessToken = cookieStore.get(accessTokenCookie)?.value;
  const refreshToken = cookieStore.get(refreshTokenCookie)?.value;

  if (type === "id") return idToken;
  else if (type === "access") return accessToken;
  else if (type === "refresh") return refreshToken;
}

async function newPasswordChallenge(
  username: string,
  password: string,
  session: string
) {
  const challengeResponses = {
    USERNAME: username,
    NEW_PASSWORD: password,
  };
  const challengeParams = {
    ChallengeName: "NEW_PASSWORD_REQUIRED",
    ClientId: process.env.COGNITO_USERPOOL_CLIENT!,
    ChallengeResponses: challengeResponses,
    Session: session,
  };

  const data: RespondToAuthChallengeResponse = await new Promise(
    (resolve, reject) => {
      return cognito.respondToAuthChallenge(
        challengeParams,
        async (err, data) => {
          if (err) {
            console.log("newPasswordChallenge failed");
            return reject(err);
          }
          //   console.log(data);
          return resolve(data);
        }
      );
    }
  );
  return data;
}

export async function initAuth({ username, password }: Credentials) {
  const usernameString = username.toString();
  const passwordString = password.toString();
  const params = {
    ...authParams,
    AuthFlow: process.env.COGNITO_AUTH_FLOW!,
    AuthParameters: {
      USERNAME: usernameString,
      PASSWORD: passwordString,
    },
  };

  try {
    const data: AdminInitiateAuthResponse = await new Promise(
      (resolve, reject) => {
        return cognito.adminInitiateAuth(params, async (err, data) => {
          if (err) return reject(err);
          return resolve(data);
        });
      }
    );

    if (data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return await newPasswordChallenge(
        usernameString,
        passwordString,
        data.Session!
      );
    }
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      console.log(err);
      throw new Error("Error @ cognito.initAuth");
    }
  }
}

export async function refreshTokenAuth(token: string) {
  const params = {
    ...authParams,
    AuthFlow: "REFRESH_TOKEN_AUTH",
    AuthParameters: {
      REFRESH_TOKEN: token,
    },
  };

  try {
    const data: AdminInitiateAuthResponse = await new Promise(
      (resolve, reject) => {
        return cognito.adminInitiateAuth(params, async (err, data) => {
          if (err) return reject(err);
          return resolve(data);
        });
      }
    );
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      console.log(err);
      throw new Error("Error @ cognito.refreshTokenAuth");
    }
  }
}