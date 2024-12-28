import { TokenosIcon } from "../ui/icons/tokenos-icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// const products = [
//   // { name: "AI", route: "/ai" },
//   // { name: "Custom links", route: "/custom-links" },
//   // { name: "QR codes", route: "/qr-codes" },
//   // { name: "Controllers", route: "/controllers" },
//   // { name: "Analytics", route: "/analytics" },
//   // { name: "Teams", route: "/teams" },
//   // { name: "API", route: "/api" },
// ];

const resources = [
  // { name: "Help center", route: "/help-center" },
  // { name: "Docs", route: "/docs" },
  // { name: "Guides", route: "/guides" },
  // { name: "Pricing", route: "/pricing" },
  // { name: "Blog", route: "/blog" },
  // { name: "Uptime", route: "/uptime" },
  { name: "Support", route: "mailto:support@tokenos.one" },
  // { name: "Docs", route: "/docs" },
];

const companyLinks = [
  // { name: "About", route: "/about" },
  // { name: "Blog", route: "/blog" },
  // { name: "Changelog", route: "/changelog" },
  // { name: "Contact", route: "/contact" },
  // { name: "Legal", route: "/legal" },
  { name: "Privacy", route: "/legal/privacy" },
  { name: "Terms", route: "/legal/terms" },
];

export const Footer = () => {
  return (
    <div className="border-t bg-background px-4 py-16">
      <div className="mx-auto max-w-screen-lg">
        <div className="grid grid-cols-[auto_auto_auto_auto] justify-between gap-6 max-sm:grid-cols-1 max-sm:gap-10">
          <div className="col-span-2 space-y-5 max-sm:col-span-1">
            <Link href="/" className="flex w-fit items-center space-x-2 font-bold max-sm:mx-auto">
              <TokenosIcon />
              <span>TokenOS</span>
            </Link>
            <p className="max-w-[300px] text-[13px] text-muted-foreground max-sm:mx-auto max-sm:text-center">
              Your gateway to the XRP Ledger.
            </p>

            <div className="w-fit max-sm:mx-auto">
              <Button size="icon" className="size-8" variant="secondary" asChild name="x-link">
                <a href="https://x.com/tokenosdotone" target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M10.4883 14.651L15.25 21H22.25L14.3917 10.5223L20.9308 3H18.2808L13.1643 8.88578L8.75 3H1.75L9.26086 13.0145L2.31915 21H4.96917L10.4883 14.651ZM16.25 19L5.75 5H7.75L18.25 19H16.25Z"></path>
                  </svg>
                </a>
              </Button>
            </div>
            {/* <div className="w-fit max-sm:mx-auto">
              <Button size="sm" variant="outline" className="space-x-2 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <span>All systems normal</span>
              </Button>
            </div> */}
          </div>
          {/* <div>
            <p className="mb-4 text-sm font-medium">Product</p>
            <div className="flex flex-col space-y-1.5">
              {products.map((product) => (
                <Link
                  href={product.route}
                  key={product.name}
                  className="w-fit text-[13px] text-muted-foreground hover:text-foreground"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          </div> */}
          {/* <div>
            <p className="mb-4 text-sm font-medium max-sm:mb-2 max-sm:text-center">Lab</p>
            <div className="flex flex-col space-y-1.5">
              {labLinks.map((tool) => (
                <Link
                  href={tool.route}
                  key={tool.name}
                  className="w-fit text-[13px] text-muted-foreground hover:text-foreground max-sm:mx-auto max-sm:text-center"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div> */}
          <div>
            <p className="mb-4 text-sm font-medium max-sm:mb-2 max-sm:text-center">Resources</p>
            <div className="flex flex-col space-y-1.5">
              {resources.map((resource) => (
                <Link
                  href={resource.route}
                  key={resource.name}
                  className="w-fit text-[13px] text-muted-foreground hover:text-foreground max-sm:mx-auto max-sm:text-center"
                >
                  {resource.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 text-sm font-medium max-sm:mb-2 max-sm:text-center">Company</p>
            <div className="flex flex-col space-y-1.5">
              {companyLinks.map((company) => (
                <Link
                  href={company.route}
                  key={company.name}
                  className="w-fit text-[13px] text-muted-foreground hover:text-foreground max-sm:mx-auto max-sm:text-center"
                >
                  {company.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between max-sm:flex-col-reverse max-sm:items-center">
          <p className="text-xs text-muted-foreground max-sm:mt-4 max-sm:text-center">
            &copy; {new Date().getFullYear()} TokenOS. All rights reserved.
          </p>

          {/* <ThemeToggle /> */}
        </div>
      </div>
    </div>
  );
};

// import NextLink from "next/link";

// export const Footer = () => {
//   return (
//     <div className="w-full border-t">
//       <div className="mx-auto max-w-screen-md px-4 py-6">
//         <div className="flex justify-between gap-4">
//           <a
//             href="mailto:support@tokenos.one"
//             target="_blank"
//             className="text-xs font-medium text-muted-foreground hover:text-foreground"
//           >
//             support@tokenos.one
//           </a>
//           <div className="flex items-center gap-4">
//             <NextLink
//               href="/legal/terms"
//               className="text-xs font-medium text-muted-foreground hover:text-foreground"
//             >
//               Terms
//             </NextLink>
//             <NextLink
//               href="/legal/privacy"
//               className="text-xs font-medium text-muted-foreground hover:text-foreground"
//             >
//               Privacy
//             </NextLink>
//           </div>
//           <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} TokenOS</p>
//         </div>
//       </div>
//     </div>
//   );
// };
