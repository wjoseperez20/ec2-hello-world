# ec2-hello-world

A personal Next.js website deployed to AWS EC2 with a fully automated CI/CD pipeline.

**Live URL:** `http://<your-elastic-ip>` *(fill in after first deploy)*

---

## Stack

| Layer | Technology |
|---|---|
| App | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Process manager | PM2 |
| Web server | Nginx |
| Infrastructure | AWS CDK (TypeScript) — `infra/` |
| Cloud | EC2 t3.micro · Ubuntu 24.04 LTS · us-west-2 |
| CI/CD | GitHub Actions |
| Tests | Jest 29 + React Testing Library |

---

## Project structure

```
.
├── app/                   Next.js App Router (pages, layout, components)
├── lib/                   Shared logic: date utilities, content constants
├── __tests__/             Unit tests
├── infra/                 AWS CDK stack (infrastructure as code)
│   ├── bin/infra.ts       CDK entry point
│   ├── lib/ec2-stack.ts   All AWS resources defined here
│   └── lib/constants.ts   Tunable values (region, ports, alarm thresholds)
├── scripts/               Shell scripts run on EC2 at first boot
├── nginx/                 Nginx server block config (checked into git)
├── .github/workflows/     CI and deploy pipelines
├── Makefile               App + infra shortcut commands
└── infra/Makefile         CDK-specific commands
```

---

## Local development

**Requires:** Node.js 24 via [nvm](https://github.com/nvm-sh/nvm)

```bash
nvm use       # switch to Node 24 (reads .nvmrc)
npm ci        # install dependencies
make dev      # http://localhost:3000
```

```bash
make test         # run unit tests
make test-watch   # re-run on file save
make test-cover   # with coverage report
make lint         # ESLint
make help         # see all commands
```

---

## How deployments work

```
git push origin main
        │
        ▼
  GitHub Actions
  ┌──────────────┐
  │  job: test   │  lint + unit tests
  └──────┬───────┘
         │ passes
         ▼
  ┌──────────────┐
  │ job: deploy  │  SSH → git pull → npm build → pm2 restart
  └──────────────┘
         │
         ▼
  EC2  Nginx → PM2 → Next.js :3000
```

Two workflows in `.github/workflows/`:

| File | Trigger | What it does |
|---|---|---|
| `ci.yml` | Every push and PR | Install → Lint → Test |
| `deploy.yml` | Push to `main` only | Lint → Test → SSH deploy |

The EC2 server clones this repo on first boot. Every deploy is `git pull + npm build + pm2 restart` — no artifact uploads, fully traceable to a commit SHA.

---

## Infrastructure

All resources are defined in `infra/lib/ec2-stack.ts`. Configuration values (region, ports, alarm thresholds) live in `infra/lib/constants.ts`.

| Resource | Details |
|---|---|
| EC2 | t3.micro · Ubuntu 24.04 LTS · 20 GiB gp3 |
| Security Group | Ingress: SSH (22), HTTP (80), HTTPS (443) |
| IAM Role | SSM Session Manager access (alternative to SSH) |
| SSH Key Pair | RSA · private key auto-stored in SSM Parameter Store |
| Elastic IP | Static IP — survives instance stop/start |
| CloudWatch | CPU > 80% alarm · Status check failure alarm |

**Estimated cost:** ~$8–10/month (t3.micro + Elastic IP + storage, us-west-2)

### Infrastructure commands

```bash
# From project root
make infra-install    # install CDK dependencies
make infra-synth      # preview CloudFormation template (no AWS calls)
make infra-diff       # show what will change vs deployed stack
make infra-deploy     # deploy to AWS
make infra-destroy    # tear everything down

# Or from infra/ directly
cd infra && make help
```

---

## Required GitHub Secrets

| Secret | Description |
|---|---|
| `EC2_SSH_PRIVATE_KEY` | Private key PEM used to SSH into EC2 |
| `EC2_HOST` | Elastic IP address of the EC2 instance |

See `AWS_SETUP.md` for how to obtain both values.

---

## Adding HTTPS

Once you have a domain pointing at the Elastic IP:

```bash
make ssh EC2_HOST=<elastic-ip>
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## SSH into the server

```bash
make ssh EC2_HOST=<elastic-ip>
```
