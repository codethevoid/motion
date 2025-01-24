import { Hero } from "@/components/landing/hero";
import { CoinSpotlight } from "@/components/landing/coin-spotlight";
import { Tools } from "@/components/landing/tools";
import { Resources } from "@/components/landing/resources";
import { API_BASE_URL } from "@/utils/api-base-url";

const getTokens = async () => {
  const response = await fetch(`${API_BASE_URL}/tokens?limit=300`);
  const data = await response.json();

  const tokens = data.tokens.map(
    (token: {
      currency: string;
      issuer: string;
      meta: { token: { name?: string; description?: string; icon?: string } };
    }) => {
      if (
        token.meta.token.name &&
        token.meta.token.description &&
        token.meta.token.icon &&
        !token.meta.token.icon.includes("null")
      ) {
        return {
          name: token.meta.token.name,
          currency: token.currency,
          issuer: token.issuer,
          icon: token.meta.token.icon,
          description: token.meta.token.description,
        };
      }
    },
  );

  return tokens.slice(0, 50);
};

const Home = async () => {
  const tokens = await getTokens();
  return (
    <div className="w-full space-y-24 py-16 max-sm:pt-4">
      <div className="px-4 max-sm:px-0">
        <Hero />
      </div>
      <CoinSpotlight tokens={tokens} />
      <Tools />
      <Resources />
    </div>
  );
};

export default Home;
