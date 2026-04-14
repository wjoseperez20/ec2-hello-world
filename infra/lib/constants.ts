// ── Deployment target ─────────────────────────────────────────────────────────
export const REGION = "us-west-2";

// ── Resource naming ───────────────────────────────────────────────────────────
// All AWS resource names are derived from APP_NAME so they stay consistent.
export const APP_NAME = "ec2-hello-world";

export const RESOURCE_NAMES = {
  stack:         "Ec2HelloWorldStack",
  securityGroup: `${APP_NAME}-sg`,
  iamRole:       `${APP_NAME}-role`,
  keyPair:       `${APP_NAME}-key`,
  instance:      APP_NAME,
  elasticIp:     `${APP_NAME}-eip`,
  cpuAlarm:      `${APP_NAME}-cpu-high`,
  statusAlarm:   `${APP_NAME}-status-check-failed`,
} as const;

// ── EC2 instance ──────────────────────────────────────────────────────────────
// Ubuntu 24.04 LTS — default SSH user is "ubuntu"
export const UBUNTU_24_AMI_SSM =
  "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id";

export const ROOT_VOLUME_GB = 20;

// ── Network ports ─────────────────────────────────────────────────────────────
export const PORTS = {
  ssh:   22,
  http:  80,
  https: 443,
} as const;

// ── CloudWatch alarms ─────────────────────────────────────────────────────────
export const ALARMS = {
  cpu: {
    threshold:         80,   // percent
    periodMinutes:     5,
    evaluationPeriods: 3,
    datapointsToAlarm: 2,    // 2 of 3 periods must breach → 10–15 min sustained
  },
  statusCheck: {
    threshold:         1,
    periodMinutes:     5,
    evaluationPeriods: 2,
  },
} as const;
