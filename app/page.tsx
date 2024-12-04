import { RainbowButton } from "@/components/ui/rainbow-button";
import { Button } from "@/components/ui/button";
import Meteors from "@/components/ui/meteors";

const Home = () => {
  return (
    <div className="overflow-hidden relative">
      <Meteors />
      <div className="py-20 px-4 min-h-screen w-full grid place-items-center">
        <div className="space-y-8">
          <div className="space-y-6">
            {/* <div className="rounded-full bg-primary/[0.08] mx-auto max-w-fit px-4 py-1">
            <AnimatedShinyText className="text-[13px]">
            <span>✨</span> Own your keys
            </AnimatedShinyText>
            </div> */}
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-center">
                Your gateway to the XRP Ledger
              </h1>
              <p className="text-center text-muted-foreground max-w-lg mx-auto">
                Connect directly to the XRP Ledger. Send, receive, and explore a
                world of decentralized possibilities with full control of your
                assets.
              </p>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <RainbowButton className="w-full max-w-[220px] hover:scale-[103%] transition-all h-10 px-8 rounded-full">
              Create wallet
            </RainbowButton>
            <Button
              size="lg"
              className="w-full max-w-[220px] rounded-full"
              variant="secondary"
            >
              Import existing wallet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
