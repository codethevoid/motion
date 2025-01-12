const Maintenance = () => {
  return (
    <div className="flex h-full h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <p className="mb-2 text-base font-semibold">We are undergoing maintenance</p>
        <p className="mb-0.5 text-center text-sm text-muted-foreground">
          We&apos;re performing some maintenance on the site.
        </p>
        <p className="text-center text-sm text-muted-foreground">We&apos;ll be back soon.</p>
      </div>
    </div>
  );
};

export default Maintenance;
