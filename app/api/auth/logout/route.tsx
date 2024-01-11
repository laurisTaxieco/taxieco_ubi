import {
  accessTokenCookie,
  idTokenCookie,
  refreshTokenCookie,
} from "@/common/const";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  cookies().delete(idTokenCookie);
  cookies().delete(accessTokenCookie);
  cookies().delete(refreshTokenCookie);

  return new Response("success", { status: 302 });
}
