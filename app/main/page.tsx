import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import Meteors from "@/components/ui/meteors";
import { appDomain, protocol } from "@/utils";

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="relative z-[-1]">
        <Meteors />
      </div>
      <div className="grid min-h-screen w-full place-items-center px-4 py-20">
        <div className="w-full space-y-8">
          <div className="w-full space-y-6">
            {/* <div className="relative z-20 mx-auto max-w-fit rounded-full border border-primary/10 bg-primary/[0.1] px-4 py-[3px]">
              <AnimatedShinyText className="text-[13px]">
                <span>✨</span> Self-custody
              </AnimatedShinyText>
            </div> */}
            <div className="space-y-2">
              <h1 className="text-center text-4xl font-bold max-sm:text-2xl max-sm:tracking-tight">
                Your gateway to the XRP Ledger
              </h1>
              <p className="mx-auto max-w-lg text-center text-muted-foreground max-sm:max-w-xs max-sm:text-sm">
                Connect directly to the XRP Ledger. Send, receive, and explore a world of
                decentralized possibilities with full control of your assets.
              </p>
            </div>
          </div>
          <div className="flex justify-center gap-4 max-sm:flex-col">
            <a
              href={`${protocol}${appDomain}/new`}
              className="w-full max-w-[220px] rounded-full max-sm:max-w-none"
            >
              <RainbowButton className="h-10 w-full rounded-full px-8 transition-all hover:scale-[103%]">
                Create wallet
              </RainbowButton>
            </a>
            <a
              href={`${protocol}${appDomain}/import`}
              className="w-full max-w-[220px] rounded-full max-sm:max-w-none"
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
