import { Leaf, Triangle, Zap } from "lucide-react";
import { ReactNode } from "react";

export type Highlight = {
  icon: ReactNode;
  title: string;
  description: string;
};

type Props = {
  highlights?: Highlight[];
};

const defaultHighlights = [
  {
    icon: <Leaf size={16} className="mx-auto" />,
    title: "Super lighweight",
    description: "All the essentials without the unnecessary feature bloat weighing you down.",
  },
  {
    icon: <Zap size={16} className="mx-auto" />,
    title: "Lightning fast",
    description:
      "  Get users to their destination quickly. Qryptic ensures that every redirect is optimized for speed.",
  },
  {
    icon: <Triangle size={16} className="mx-auto" />,
    title: "Modern interface",
    description:
      "Enjoy an interface that's crafted to make navigation and usage straightforward and visually appealing.",
  },
];

export const Highlights = ({ highlights = defaultHighlights }: Props) => {
  return (
    <div className="border-b border-t bg-background/60 px-4 py-8">
      <div className="mx-auto max-w-screen-lg space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-20 max-md:grid-cols-1 max-md:gap-10">
            {highlights.map((highlight) => (
              <div className="space-y-2.5" key={highlight.title}>
                {highlight.icon}
                <div>
                  <p className="text-center text-[13px] font-medium">{highlight.title}</p>
                  <p className="text-center text-xs text-muted-foreground max-md:mx-auto max-md:max-w-[300px]">
                    {highlight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
