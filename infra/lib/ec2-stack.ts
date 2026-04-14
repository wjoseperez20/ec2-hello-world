import * as fs from "fs";
import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { Construct } from "constructs";
import {
  RESOURCE_NAMES,
  UBUNTU_24_AMI_SSM,
  ROOT_VOLUME_GB,
  PORTS,
  ALARMS,
} from "./constants";

export class Ec2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── VPC ────────────────────────────────────────────────────────────────
    const vpc = ec2.Vpc.fromLookup(this, "DefaultVpc", { isDefault: true });

    // ── Security Group ─────────────────────────────────────────────────────
    const sg = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      securityGroupName: RESOURCE_NAMES.securityGroup,
      description: "Allow HTTP, HTTPS, and SSH",
      allowAllOutbound: true,
    });
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(PORTS.ssh),   "SSH");
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(PORTS.http),  "HTTP");
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(PORTS.https), "HTTPS");

    // ── IAM Role ───────────────────────────────────────────────────────────
    const role = new iam.Role(this, "InstanceRole", {
      roleName: RESOURCE_NAMES.iamRole,
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
      ],
    });

    // ── SSH Key Pair ───────────────────────────────────────────────────────
    // CDK stores the private key automatically in SSM Parameter Store at:
    // /ec2/keypairs/<keyPairName>
    const keyPair = new ec2.KeyPair(this, "KeyPair", {
      keyPairName: RESOURCE_NAMES.keyPair,
      type: ec2.KeyPairType.RSA,
      format: ec2.KeyPairFormat.PEM,
    });

    // ── UserData ───────────────────────────────────────────────────────────
    const bootstrapScript = fs.readFileSync(
      path.join(__dirname, "../../scripts/bootstrap-ec2.sh"),
      "utf8"
    );
    const userData = ec2.UserData.forLinux();
    userData.addCommands(bootstrapScript);

    // ── EC2 Instance ───────────────────────────────────────────────────────
    const instance = new ec2.Instance(this, "Instance", {
      vpc,
      instanceName: RESOURCE_NAMES.instance,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.fromSsmParameter(UBUNTU_24_AMI_SSM, {
        os: ec2.OperatingSystemType.LINUX,
      }),
      securityGroup: sg,
      role,
      keyPair,
      userData,
      blockDevices: [
        {
          deviceName: "/dev/sda1",
          volume: ec2.BlockDeviceVolume.ebs(ROOT_VOLUME_GB, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            deleteOnTermination: true,
          }),
        },
      ],
    });

    // ── Elastic IP ─────────────────────────────────────────────────────────
    const eip = new ec2.CfnEIP(this, "ElasticIP", {
      domain: "vpc",
      tags: [{ key: "Name", value: RESOURCE_NAMES.elasticIp }],
    });
    new ec2.CfnEIPAssociation(this, "EIPAssociation", {
      instanceId: instance.instanceId,
      allocationId: eip.attrAllocationId,
    });

    // ── CloudWatch Alarm: CPU ──────────────────────────────────────────────
    new cloudwatch.Alarm(this, "CpuAlarm", {
      alarmName: RESOURCE_NAMES.cpuAlarm,
      alarmDescription: `CPU > ${ALARMS.cpu.threshold}% for ${ALARMS.cpu.datapointsToAlarm} of ${ALARMS.cpu.evaluationPeriods} periods`,
      metric: new cloudwatch.Metric({
        namespace: "AWS/EC2",
        metricName: "CPUUtilization",
        dimensionsMap: { InstanceId: instance.instanceId },
        period: cdk.Duration.minutes(ALARMS.cpu.periodMinutes),
        statistic: "Average",
      }),
      threshold: ALARMS.cpu.threshold,
      evaluationPeriods: ALARMS.cpu.evaluationPeriods,
      datapointsToAlarm: ALARMS.cpu.datapointsToAlarm,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // ── CloudWatch Alarm: Status Check ─────────────────────────────────────
    new cloudwatch.Alarm(this, "StatusCheckAlarm", {
      alarmName: RESOURCE_NAMES.statusAlarm,
      alarmDescription: "EC2 instance failed a status check",
      metric: new cloudwatch.Metric({
        namespace: "AWS/EC2",
        metricName: "StatusCheckFailed",
        dimensionsMap: { InstanceId: instance.instanceId },
        period: cdk.Duration.minutes(ALARMS.statusCheck.periodMinutes),
        statistic: "Maximum",
      }),
      threshold: ALARMS.statusCheck.threshold,
      evaluationPeriods: ALARMS.statusCheck.evaluationPeriods,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // ── Stack Outputs ──────────────────────────────────────────────────────
    new cdk.CfnOutput(this, "ElasticIp", {
      value: eip.ref,
      description: "Use this as the EC2_HOST GitHub secret",
    });
    new cdk.CfnOutput(this, "InstanceId", {
      value: instance.instanceId,
      description: "EC2 Instance ID",
    });
    new cdk.CfnOutput(this, "KeyPairName", {
      value: keyPair.keyPairName,
      description: "Private key is in SSM — see AWS_SETUP.md Step 5",
    });
    new cdk.CfnOutput(this, "SecurityGroupId", {
      value: sg.securityGroupId,
      description: "Security Group ID",
    });
  }
}
