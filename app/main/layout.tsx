import { Footer } from "@/components/layout/footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
