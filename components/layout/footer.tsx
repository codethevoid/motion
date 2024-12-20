import NextLink from "next/link";

export const Footer = () => {
  return (
    <div className="w-full border-t">
      <div className="mx-auto max-w-screen-md px-4 py-6">
        <div className="flex justify-between gap-4">
          <a
            href="mailto:support@tokenos.one"
            target="_blank"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            support@tokenos.one
          </a>
          <div className="flex items-center gap-4">
            <NextLink
              href="/legal/terms"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Terms
            </NextLink>
            <NextLink
              href="/legal/privacy"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Privacy
            </NextLink>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} TokenOS</p>
        </div>
      </div>
    </div>
  );
};
