#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Ec2Stack } from "../lib/ec2-stack";
import { REGION, RESOURCE_NAMES } from "../lib/constants";

// CDK sets CDK_DEFAULT_ACCOUNT when invoked via the CLI.
// The infra/Makefile injects AWS_ACCOUNT_ID as a fallback so Vpc.fromLookup
// always has an explicit account at synthesis time.
const account =
  process.env.CDK_DEFAULT_ACCOUNT ??
  process.env.AWS_ACCOUNT_ID;

if (!account) {
  throw new Error(
    [
      "",
      "  AWS account ID could not be resolved.",
      "  Use the Makefile — it resolves the account automatically:",
      "",
      "    make deploy          (from infra/ directory)",
      "    make infra-deploy    (from project root)",
      "",
      "  Or set it manually:",
      "    export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)",
      "",
    ].join("\n")
  );
}

const app = new cdk.App();

new Ec2Stack(app, RESOURCE_NAMES.stack, {
  env: { account, region: REGION },
  description: "ec2-hello-world — Next.js app on EC2 with Nginx + PM2",
});
