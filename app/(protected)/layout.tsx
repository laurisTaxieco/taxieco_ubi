import Navbar from "@/common/components/navbar/Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Navbar>{children}</Navbar>;
}
