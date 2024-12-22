const PrivacyPage = () => {
  return (
    <div className="mx-auto max-w-screen-md px-4 py-16">
      <article className="prose prose-sm w-full max-w-none dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>
          <strong>Effective Date:</strong> December 17, 2024
        </p>
        <p>
          Welcome to TokenOS. This Privacy Policy explains how we collect, use, and protect your
          information when you use our wallet application and related services.
        </p>
        <p>
          By accessing or using TokenOS, you agree to the practices described in this Privacy
          Policy. If you do not agree, please do not use our services.
        </p>

        <h2>Key Takeaways for Users</h2>
        <ul>
          <li>
            We do not collect or store your private keys or seed phrases. Your wallet is fully under
            your control.
          </li>
          <li>Limited, anonymized data may be collected to improve app performance.</li>
          <li>
            Always safeguard your private keys and seed phrases — we cannot recover them if lost.
          </li>
        </ul>
        <h2>Information We Do Not Collect</h2>
        <p>
          At TokenOS, your privacy and security are our top priorities. We do not collect or store:
        </p>
        <ul>
          <li>Your private keys or seed phrases.</li>
          <li>Your wallet balances, transaction history, or other XRPL-related account data.</li>
          <li>
            Personal information like your name, address, or contact details unless explicitly
            provided by you.
          </li>
        </ul>
        <p>Your wallet and data remain under your full control.</p>

        <h2>Information We May Collect</h2>
        <p>
          While using our services, we may collect limited information to improve functionality and
          provide a better experience. This includes:
        </p>
        <ul>
          <li>
            <strong>Device Information:</strong> Non-identifiable data such as device type,
            operating system, and app version.
          </li>
          <li>
            <strong>Usage Data:</strong> Anonymized data regarding app usage (e.g., errors, session
            duration) to improve performance.
          </li>
          <li>
            <strong>Contact Information (optional):</strong> If you contact us for support, we may
            store your email address or message content to assist you.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the limited information we collect to:</p>
        <ul>
          <li>Improve the performance, functionality, and user experience of TokenOS.</li>
          <li>Respond to customer inquiries and provide technical support.</li>
          <li>Monitor and analyze usage to identify and fix issues.</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>
          We may use trusted third-party services (e.g., analytics providers) to help us improve the
          app. These services do not have access to your private keys, seed phrases, or wallet data.
        </p>
        <p>
          We encourage you to review the privacy policies of any third-party services you interact
          with while using TokenOS.
        </p>

        <h2>Security</h2>
        <p>
          We take security seriously and implement industry-standard measures to protect the app and
          its functionality. However:
        </p>
        <ul>
          <li>You are fully responsible for safeguarding your private keys and seed phrases.</li>
          <li>Losing this information may result in permanent loss of access to your wallet.</li>
          <li>
            TokenOS does not store or have access to your keys or wallet contents, so we cannot
            recover lost data.
          </li>
        </ul>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 18. We do not knowingly
          collect personal information from children.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be reflected on this
          page, and the &quot;Effective Date&quot; will be updated. By continuing to use our
          services, you accept the revised Privacy Policy.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or need support, please contact us:
        </p>
        <ul>
          <li>
            <strong>Email:</strong> support@tokenos.one
          </li>
        </ul>
      </article>
    </div>
  );
};

export default PrivacyPage;
