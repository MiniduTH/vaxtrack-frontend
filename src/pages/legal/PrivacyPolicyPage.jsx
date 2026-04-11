import LegalPageShell from './LegalPageShell';

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={lastUpdated}>
      <p>
        VaxTrack (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates a vaccination tracking
        and clinic management platform. This Privacy Policy describes how we collect, use, and protect
        information when you use our website and related services.
      </p>

      <Section title="Information we collect">
        <p>
          We may collect information you provide when you register or use the service, such as your
          name, email address, phone number, national identification details where required, and
          information about dependents you add to your account. We may also collect usage data and
          technical information (for example, browser type and approximate location) to operate and
          improve the service.
        </p>
      </Section>

      <Section title="How we use your information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide, maintain, and improve VaxTrack features (appointments, records, notifications)</li>
          <li>Authenticate users and enforce role-based access</li>
          <li>Send service-related messages, such as vaccination confirmations or reminders</li>
          <li>Comply with legal obligations and protect the security of the platform</li>
        </ul>
      </Section>

      <Section title="Sharing of information">
        <p>
          We do not sell your personal information. We may share data with service providers that help
          us run the platform (for example, hosting, email delivery, or maps), subject to appropriate
          safeguards. We may disclose information if required by law or to protect rights and safety.
        </p>
      </Section>

      <Section title="Data retention and security">
        <p>
          We retain information for as long as needed to provide the service and meet legal
          requirements. We use reasonable technical and organizational measures to protect your data,
          but no method of transmission over the internet is completely secure.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, or delete certain
          personal information. Contact us using the details provided by your organization or
          administrator to make a request.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the
          top will reflect the latest version. Continued use of VaxTrack after changes constitutes
          acceptance of the updated policy.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For privacy-related questions, please contact the team or institution responsible for your
          VaxTrack deployment.
        </p>
      </Section>
    </LegalPageShell>
  );
}
