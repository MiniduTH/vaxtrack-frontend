import LegalPageShell from './LegalPageShell';

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function TermsOfServicePage() {
  const lastUpdated = new Date().toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <LegalPageShell title="Terms of Service" lastUpdated={lastUpdated}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of VaxTrack
        (&quot;Service&quot;). By creating an account or using the Service, you agree to these Terms.
      </p>

      <Section title="The Service">
        <p>
          VaxTrack provides tools for vaccination scheduling, records, inventory-related workflows, and
          related features. The Service is intended for lawful use in connection with vaccination and
          clinic operations. Features available to you depend on your account role (for example, public
          user, hospital staff, or administrator).
        </p>
      </Section>

      <Section title="Accounts and eligibility">
        <p>
          You must provide accurate registration information and keep your credentials confidential. You
          are responsible for activity under your account. You may not share your account in a way that
          violates these Terms or applicable law.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Misuse the Service or attempt to access data you are not authorized to view</li>
          <li>Introduce malware, disrupt systems, or probe for vulnerabilities without permission</li>
          <li>Use the Service for any unlawful purpose or in violation of third-party rights</li>
        </ul>
      </Section>

      <Section title="Medical and legal disclaimer">
        <p>
          VaxTrack is a software tool for managing information and workflows. It does not replace
          professional medical advice, diagnosis, or treatment. Clinical decisions remain the
          responsibility of qualified healthcare providers. The Service is provided &quot;as is&quot;
          to the extent permitted by law, without warranties of uninterrupted or error-free operation.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by applicable law, VaxTrack and its contributors shall not
          be liable for any indirect, incidental, special, consequential, or punitive damages arising
          from your use of the Service.
        </p>
      </Section>

      <Section title="Changes and termination">
        <p>
          We may modify these Terms or the Service. We will indicate updates by changing the
          &quot;Last updated&quot; date. We may suspend or terminate access for violations of these Terms
          or operational reasons. You may stop using the Service at any time.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For questions about these Terms, contact the organization operating your VaxTrack instance
          or the project maintainers as directed by your administrator.
        </p>
      </Section>
    </LegalPageShell>
  );
}
