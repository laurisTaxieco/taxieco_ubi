import { NextRequest, NextResponse } from "next/server";
import {
  decodeProtectedHeader,
  jwtVerify,
  createRemoteJWKSet,
  decodeJwt,
} from "jose";
import {
  accessTokenCookie,
  idTokenCookie,
  refreshTokenCookie,
  refreshUrl,
} from "./common/const";

const JWKS = createRemoteJWKSet(new URL(process.env.COGNITO_URI!));

const nodeEnv = process.env.NODE_ENV;

const baseURL = nodeEnv !== "production" ? "http://localhost:3000" : "";

function decodeHeader(token: string) {
  try {
    const header = decodeProtectedHeader(token);
    return header;
  } catch (err) {
    console.log("error @ middleware.decodeHeader");
    console.log(err);
    return { message: "invalid token header" };
  }
}

function decodePayload(token: string) {
  try {
    const payload = decodeJwt(token);
    const { sub, username } = payload;
    const returnable = {
      sub: sub,
      username: username,
    };
    return returnable;
  } catch (err) {
    console.log("error @ middleware.decodePayload");
    console.log(err);
    return { message: "invalid token payload" };
  }
}

async function verifyToken(token: string) {
  const kid = decodeHeader(token).kid;

  if (kid === undefined) {
    console.log("undefined kid @ middleware.verifyToken");
    throw new Error("invalid token");
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    const { sub, username } = payload;
    const returnable = {
      sub: sub,
      username: username,
    };

    return returnable;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.name);
    } else {
      console.log("error @ middleware.verifyToken");
      console.log(err);
      throw new Error("error @ middleware.verifyToken");
    }
  }
}

export async function middleware(request: NextRequest) {
  let accessToken = request.cookies.get(accessTokenCookie);
  let refreshToken = request.cookies.get(refreshTokenCookie);

  async function refreshTokenAuth(token: string) {
    const data = await fetch(baseURL + refreshUrl, {
      method: "POST",
      headers: {
        refresh: token,
      },
    }).then((item) => item.json());

    if (data?.accessToken !== undefined) {
      const response = NextResponse.next();
      response.cookies.set(accessTokenCookie, data.accessToken, {
        httpOnly: true,
      });
      return response;
    } else {
      return redirect();
    }
  }

  function redirect() {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set(idTokenCookie, "", { maxAge: -1 });
    response.cookies.set(accessTokenCookie, "", { maxAge: -1 });
    response.cookies.set(refreshTokenCookie, "", { maxAge: -1 });
    return response;
  }

  if (accessToken === undefined && refreshToken !== undefined) {
    console.log("no access token, refresh token = " + refreshToken.value);
    return refreshTokenAuth(refreshToken.value);
  } else if (accessToken !== undefined) {
    try {
      await verifyToken(accessToken.value);
      return NextResponse.next();
    } catch (err) {
      if (
        err instanceof Error &&
        err.message === "JWTExpired" &&
        refreshToken !== undefined
      ) {
        console.log(decodePayload(accessToken.value));
        console.log("JWT Expired");
        return refreshTokenAuth(refreshToken.value);
      } else {
        console.log(decodePayload(accessToken.value));
        console.log("error @ middleware.middleware");
        console.log(err);
        return redirect();
      }
    }
  }

  return redirect();
}

export const config = {
  //matcher: ["/api/((?!auth))(.*)", "/"], // match all /api routes except /api/login or /api/refresh
  // matcher: ["/((?!login$|$))(.*)"],
  matcher: [
    "/((?!login$|api/auth/|_next/static|_next/image|images|favicon.ico))(.*)",
  ],
};
