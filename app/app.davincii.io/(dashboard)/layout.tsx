import { Nav } from "./(wallet)/components/nav";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="mx-auto max-w-screen-sm space-y-3 px-4 py-4">
      <Nav />
      {children}
    </div>
  );
};

export default DashboardLayout;
