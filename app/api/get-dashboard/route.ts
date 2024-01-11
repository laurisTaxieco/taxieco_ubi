import { getToken } from "@/common/utils/cognito";
import {
  assumeRole,
  getDashboard,
  isQSCredentials,
} from "@/common/utils/quicksight";
import AWS from "aws-sdk";
import { decodeJwt } from "jose";

const isValidGetDashboardResponse = (
  response: unknown
): response is AWS.QuickSight.GenerateEmbedUrlForRegisteredUserResponse => {
  if (
    response !== null &&
    typeof response === "object" &&
    "Status" in response &&
    response.Status === 200
  ) {
    return true;
  }
  return false;
};

function httpResponse(message: string, status: number, embedUrl?: string) {
  const returnable: { message: string; embedUrl?: string } = {
    message: message,
  };

  if (embedUrl !== undefined || embedUrl !== null) {
    returnable.embedUrl = embedUrl;
  }

  return new Response(JSON.stringify(returnable), {
    status: status,
  });
}

export async function GET() {
  const accessToken = await getToken("access");
  const tokenPayload = decodeJwt(accessToken!);

  const { username } = tokenPayload;

  if (typeof username !== "string") {
    console.log("invalid token @  /test");
    return httpResponse("Conflict", 409);
  }

  try {
    const assumedRole = await assumeRole(username);
    console.log(assumedRole);

    if (isQSCredentials(assumedRole) === false) {
      return httpResponse("Internal Error", 500);
    } else {
      const response = await getDashboard(assumedRole, username)
        .then((data) => data)
        .catch((err) => {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          console.log(err);
          throw new Error("custom error @ /api/get-dashboard"); //
        });

      if (isValidGetDashboardResponse(response)) {
        console.log(response.EmbedUrl); //
        return httpResponse("success", 200, response.EmbedUrl);
      } else {
        throw new Error(response);
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "maximum recursion limit, generate dashboard") {
        return httpResponse("Service Unavailable", 503);
      }
      console.log(err.message);
    }
    console.log(err);
    return httpResponse("Internal Error", 500);
  }
}
