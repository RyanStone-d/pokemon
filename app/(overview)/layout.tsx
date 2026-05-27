import { SideNav } from "../side-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col  h-screen md:flex-row">
      <div className="w-full md:w-64">
        <SideNav />
      </div>
      <div className="grow overflow-y-auto">{children}</div>
    </div>
  );
}
