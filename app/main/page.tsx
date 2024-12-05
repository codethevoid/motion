import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import Meteors from "@/components/ui/meteors";
import { appDomain, protocol } from "@/utils";

export const metadata = {
  title: "Davincii",
  description: "Your gateway to the XRP Ledger",
};

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="relative z-[-1]">
        <Meteors />
      </div>
      <div className="grid min-h-screen w-full place-items-center px-4 py-20">
        <div className="space-y-8">
          <div className="space-y-6">
            {/* <div className="rounded-full bg-primary/[0.08] mx-auto max-w-fit px-4 py-1">
            <AnimatedShinyText className="text-[13px]">
            <span>✨</span> Own your keys
            </AnimatedShinyText>
            </div> */}
            <div className="space-y-2">
              <h1 className="text-center text-4xl font-bold">Your gateway to the XRP Ledger</h1>
              <p className="mx-auto max-w-lg text-center text-muted-foreground">
                Connect directly to the XRP Ledger. Send, receive, and explore a world of
                decentralized possibilities with full control of your assets.
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <a href={`${protocol}${appDomain}/new`} className="w-full max-w-[220px] rounded-full">
              <RainbowButton className="h-10 w-full rounded-full px-8 transition-all hover:scale-[103%]">
                Create wallet
              </RainbowButton>
            </a>
            <a
              href={`${protocol}${appDomain}/import`}
              className="w-full max-w-[220px] rounded-full"
            >
              <Button size="lg" className="w-full rounded-full" variant="secondary">
                Import existing wallet
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
