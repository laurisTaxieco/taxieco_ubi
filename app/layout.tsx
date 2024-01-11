import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UBI Dashboard",
  description: "UBI Dashboard by Taxieco",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="https://taxieco.org/wp-content/uploads/2022/04/cropped-taxieco_favicon2-1.png"
        />
      </head>
      <body className="relative">{children}</body>
    </html>
  );
}
