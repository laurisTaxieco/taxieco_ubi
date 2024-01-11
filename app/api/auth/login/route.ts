import { Credentials, initAuth } from "@/common/utils/cognito";
import { cookies } from "next/headers";
import { AdminInitiateAuthResponse } from "aws-sdk/clients/cognitoidentityserviceprovider";
import {
  accessTokenCookie,
  idTokenCookie,
  refreshTokenCookie,
} from "@/common/const";

export async function POST(request: Request) {
  // const formData = await request.formData();

  // const credentials: Credentials = {
  //   username: formData.get("username")!,
  //   password: formData.get("password")!,
  // };

  const body = await request.json();

  const credentials: Credentials = {
    username: body.username,
    password: body.password,
  };

  try {
    const data: AdminInitiateAuthResponse | undefined = await initAuth(
      credentials
    );

    if (data?.AuthenticationResult) {
      const idToken = data.AuthenticationResult.IdToken;
      const accessToken = data.AuthenticationResult.AccessToken;
      const refreshToken = data.AuthenticationResult.RefreshToken;

      cookies().set(idTokenCookie, idToken!, { httpOnly: true });
      cookies().set(accessTokenCookie, accessToken!, { httpOnly: true });
      cookies().set(refreshTokenCookie, refreshToken!, { httpOnly: true });
    }

    return new Response(JSON.stringify({ message: "success" }), {
      status: 200,
    });
  } catch (err) {
    console.log("/login failed: " + err);
    return new Response(JSON.stringify({ message: "Forbidden" }), {
      status: 403,
    });
  }
}
