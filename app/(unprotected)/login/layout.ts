import { accessTokenCookie, refreshTokenCookie } from "@/common/const";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  if (
    cookieStore.get(accessTokenCookie) ||
    cookieStore.get(refreshTokenCookie)
  ) {
    redirect("/");
  }
  return children;
}
