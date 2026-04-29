import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const mainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer/>
    </>
  );
};

export default mainLayout;
