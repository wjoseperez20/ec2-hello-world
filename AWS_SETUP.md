# AWS + GitHub Setup Guide

> **Delete this file once you have completed all steps.**

---

## What you need before starting

- AWS account with admin access
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) installed globally: `npm install -g aws-cdk`
- Your GitHub repo already pushed and accessible

---

## Step 1 — Configure AWS credentials locally

```bash
aws configure
```

Enter when prompted:
- **Access Key ID** — from IAM → Users → your user → Security credentials
- **Secret Access Key** — same place (only shown once when created)
- **Default region** — `us-west-2`
- **Default output format** — `json`

Verify it works:

```bash
aws sts get-caller-identity
# Should print your account ID and user ARN
```

---

## Step 2 — Set your GitHub repo URL in the bootstrap script

Open `scripts/bootstrap-ec2.sh` and find this line near the top:

```bash
REPO_URL="https://github.com/YOUR_GITHUB_USERNAME/ec2-hello-world.git"
```

Replace it with your actual repo URL, then commit and push **before** deploying:

```bash
git add scripts/bootstrap-ec2.sh
git commit -m "chore: set repo URL for EC2 bootstrap"
git push origin main
```

> The EC2 instance clones this repo on first boot. If the URL is wrong, the app won't start.

---

## Step 3 — Bootstrap CDK (one time per AWS account + region)

```bash
cd infra
make install

# Bootstrap using your account ID resolved from your local credentials
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_ACCOUNT_ID=$ACCOUNT npx cdk bootstrap aws://$ACCOUNT/us-west-2
```

This creates a CloudFormation stack called `CDKToolkit` that CDK needs to store assets. You only run this once.

---

## Step 4 — Deploy the infrastructure

From the `infra/` directory:

```bash
make deploy
```

Or from the project root:

```bash
make infra-deploy
```

CDK will show a list of resources it will create and ask for confirmation. Type `y`.

**Expected duration:** ~3 minutes.

At the end you will see outputs — copy the `ElasticIp` value:

```
Ec2HelloWorldStack.ElasticIp       = 54.xxx.xxx.xxx   ← you need this
Ec2HelloWorldStack.InstanceId      = i-xxxxxxxxxx
Ec2HelloWorldStack.KeyPairName     = ec2-hello-world-key
Ec2HelloWorldStack.SecurityGroupId = sg-xxxxxxxxxx
```

---

## Step 5 — Retrieve the SSH private key

CDK automatically stored the private key in AWS SSM Parameter Store. Retrieve it:

```bash
aws ssm get-parameter \
  --name /ec2/keypairs/ec2-hello-world-key \
  --with-decryption \
  --query Parameter.Value \
  --output text \
  --region us-west-2 > /tmp/ec2-key.pem

chmod 600 /tmp/ec2-key.pem
```

---

## Step 6 — Wait for the server to finish setting up

The EC2 instance runs a bootstrap script on first boot that installs Node.js, Nginx, PM2, clones the repo, and builds the app. **This takes about 5 minutes.**

Monitor progress by SSHing in:

```bash
ssh -i /tmp/ec2-key.pem ubuntu@<ElasticIp>
sudo tail -f /var/log/cloud-init-output.log
```

Once you see "Bootstrap complete", verify the site works:

```bash
curl http://<ElasticIp>
# Should return HTML
```

---

## Step 7 — Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.

Add these two secrets:

| Secret name | Value |
|---|---|
| `EC2_SSH_PRIVATE_KEY` | Paste the full contents of `/tmp/ec2-key.pem` — including the `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----` lines |
| `EC2_HOST` | The Elastic IP from Step 4 (e.g., `54.xxx.xxx.xxx`) |

Then delete the local key:

```bash
rm /tmp/ec2-key.pem
```

---

## Step 8 — Trigger the first automated deploy

```bash
git commit --allow-empty -m "ci: trigger first automated deploy"
git push origin main
```

Go to your repo's **Actions** tab. You should see the **Deploy** workflow running. Once it passes (green checkmark), visit `http://<ElasticIp>` to confirm.

---

## Adding HTTPS later

Once you point a domain at the Elastic IP:

```bash
make ssh EC2_HOST=<ElasticIp>
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot handles certificate renewal automatically.

---

## Tearing everything down

```bash
make infra-destroy    # from project root
# or
make destroy          # from infra/ directory
```

> This permanently deletes the EC2 instance, Elastic IP, security group, IAM role, and key pair.
