import { getToken } from "@/lib/middleware/utils/get-token";
import { getAddress } from "@/lib/token";

const DashboardHome = async () => {
  const token = await getToken();
  const address = await getAddress(token as string);
  return <div>{address}</div>;
};

export default DashboardHome;
