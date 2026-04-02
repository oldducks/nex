export default function ManageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="manage-control-theme min-h-screen">{children}</div>;
}
