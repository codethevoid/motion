import { Hero } from "@/components/landing/hero";
import { CoinSpotlight } from "@/components/landing/coin-spotlight";
import { Tools } from "@/components/landing/tools";

const Home = () => {
  return (
    <div className="w-full space-y-24 py-20">
      <div className="px-4">
        <Hero />
      </div>
      <CoinSpotlight />
      <Tools />
    </div>
  );
};

export default Home;
