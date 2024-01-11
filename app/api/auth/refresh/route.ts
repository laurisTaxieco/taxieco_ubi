import { refreshTokenCookie } from "@/common/const";
import { refreshTokenAuth } from "@/common/utils/cognito";
import { AdminInitiateAuthResponse } from "aws-sdk/clients/cognitoidentityserviceprovider";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { headers } = request;
  const refreshToken = headers.get(refreshTokenCookie);

  if (refreshToken === null || refreshToken === undefined) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const data: AdminInitiateAuthResponse | undefined = await refreshTokenAuth(
      refreshToken
    );

    if (data?.AuthenticationResult?.AccessToken) {
      const accessToken = data.AuthenticationResult.AccessToken;
      return new Response(
        JSON.stringify({ message: "success", accessToken: accessToken }),
        {
          status: 200,
        }
      );
    } else {
      console.log("/refresh failed: " + data);
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
  } catch (err) {
    console.log("/refresh failed: " + err);
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
}
