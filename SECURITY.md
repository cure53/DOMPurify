## Supported Versions

Always the latest release.

## Reporting a Vulnerability

First of all, please immediately contact us via [email](mailto:mario@cure53.de) so we can work on a fix. [PGP key](https://keyserver.ubuntu.com/pks/lookup?op=vindex&search=0xC26C858090F70ADA)

Also, you probably qualify for a bug bounty! The fine folks over at [Fastmail](https://www.fastmail.com/) use DOMPurify for their services and added our library to their bug bounty scope. So, if you find a way to bypass or weaken DOMPurify, please also have a look at their website and the [bug bounty info](https://www.fastmail.com/about/bugbounty/).

## Supply Chain Security

DOMPurify is downloaded by hundreds of millions of CI runs and dependent
applications every month. We treat its supply chain accordingly.

### Release integrity

- Every release is built and signed from a tagged commit on the `3.x` branch.
- Source archives and bundled artifacts are Sigstore-signed; `.sigstore.json`
  bundles are attached to each GitHub release.
- SLSA build provenance is generated for the bundled artifacts and attached as
  an `.intoto.jsonl` file on the release page from 3.4.3 onward.
- Git tags are annotated and GPG-signed by the maintainer. Verify with
  `git tag -v <version>`.

### Publish process

DOMPurify is published to npm **manually from the maintainer's laptop**, not
from a GitHub Actions workflow. This is a deliberate choice:

- An automated publish workflow requires a long-lived npm token stored as a
  repository secret. Any actor who can land a workflow change can reach that
  token. For a package at DOMPurify's reach, the blast radius of such a
  compromise is unacceptable.
- The npm provenance attestation produced by automated publish is valuable but
  not worth the expanded attack surface. Sigstore signing of the GitHub
  release artifacts and SLSA provenance attached to the release provide the
  audit trail that consumers need.

If you find an issue or pull request suggesting we automate npm publish or
adopt npm "trusted publishers," please be aware that this is a deliberate
policy decision and not an oversight. We will not adopt either.

### Workflow hardening

- All third-party GitHub Actions are pinned by full commit SHA. Tag-based
  references (`@v4`, `@main`) are not used anywhere in this repository.
- Every workflow runs under `step-security/harden-runner` for egress
  monitoring.
- `actions/checkout` uses `persist-credentials: false` everywhere, so the
  Git credential is not left available for later steps.
- `npm ci` is invoked with `--ignore-scripts` in every CI workflow. Dependency
  install scripts are the exfiltration path used by Shai-Hulud-class attacks;
  blocking them removes the most common compromise vector.
- Workflow-level `permissions` defaults to `contents: read`, with elevated
  permissions scoped to the specific jobs that need them (signing,
  attestations).
- No npm publish token exists as a repository secret. The only sensitive
  secret in the repository is `SCORECARD_TOKEN`, a fine-grained, repo-scoped,
  time-bounded PAT used by the weekly OpenSSF Scorecard run.

### Verification

To verify a published artifact yourself:

```bash
# Verify the git tag signature
git tag -v <version>

# Verify a release artifact against its Sigstore bundle
cosign verify-blob \
  --bundle <version>.tar.gz.sigstore.json \
  --certificate-identity-regexp 'https://github.com/cure53/DOMPurify/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  <version>.tar.gz
```

The maintainer's GPG public key fingerprint is referenced above.

### Reporting supply chain concerns

If you spot a workflow, dependency, or release-process issue that you believe
weakens the supply chain, please report it via the same channel as a
vulnerability report (email above). Issues that touch the release infrastructure
are treated with the same urgency as sanitization bypasses.
