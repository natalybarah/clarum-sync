import Header from "@/components/header";



export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header/>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
