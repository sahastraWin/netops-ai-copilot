// scripts/seed.ts
// Seeds the database with demo accounts for testing
// Run with: npx tsx scripts/seed.ts
// 
// Creates 3 demo users:
//   admin@netops.dev    / admin123   → ADMIN
//   senior@netops.dev   / senior123  → SENIOR_ENGINEER
//   junior@netops.dev   / junior123  → JUNIOR_ENGINEER

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  const users = [
    {
      name: "Admin User",
      email: "admin@netops.dev",
      password: "admin123",
      role: "ADMIN" as const,
    },
    {
      name: "Senior Engineer",
      email: "senior@netops.dev",
      password: "senior123",
      role: "SENIOR_ENGINEER" as const,
    },
    {
      name: "Junior Engineer",
      email: "junior@netops.dev",
      password: "junior123",
      role: "JUNIOR_ENGINEER" as const,
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role,
        password: hashedPassword,
      },
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });

    console.log(`✅ ${userData.role}: ${userData.email} / ${userData.password}`);
  }

  // Seed some sample log entries for the admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@netops.dev" },
  });

  if (adminUser) {
    const sampleLogs = [
      {
        rawLog: `%BGP-5-ADJCHANGE: neighbor 10.0.0.1 Down Hold Timer Expired\n%BGP-3-NOTIFICATION: sent to neighbor 10.0.0.1 4/0 (hold time expired)`,
        deviceType: "ROUTER" as const,
        severity: "HIGH" as const,
        analysisResult: "BGP session instability detected. Hold timer expired.",
        anomalies: ["BGP neighbor down", "Hold timer expiry"],
        tags: ["BGP", "Routing"],
      },
      {
        rawLog: `%SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: admin] [Source: 192.168.100.50]\n%SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: root] [Source: 192.168.100.50]`,
        deviceType: "FIREWALL" as const,
        severity: "CRITICAL" as const,
        analysisResult: "Brute force attack detected from 192.168.100.50.",
        anomalies: ["Multiple login failures", "Brute force attempt"],
        tags: ["Security", "Auth"],
      },
      {
        rawLog: `%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down\n%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down`,
        deviceType: "SWITCH" as const,
        severity: "MEDIUM" as const,
        analysisResult: "Interface flapping detected on GigabitEthernet0/1.",
        anomalies: ["Interface down", "Link flapping"],
        tags: ["Interface"],
      },
    ];

    for (const log of sampleLogs) {
      await prisma.logEntry.create({
        data: { userId: adminUser.id, ...log },
      });
    }
    console.log("\n✅ Sample log entries created");

    // Sample saved configs
    const sampleConfigs = [
      {
        title: "Block 192.168.1.50 ACL",
        intent: "Block IP 192.168.1.50 and allow everything else",
        generatedConfig: `! Standard ACL to block specific host\nip access-list standard BLOCK_HOST\n deny host 192.168.1.50\n permit any\n!\ninterface GigabitEthernet0/0\n ip access-group BLOCK_HOST in`,
        deviceType: "ROUTER" as const,
        platform: "Cisco IOS",
        tags: ["ACL", "Security"],
      },
      {
        title: "SSH Hardening Config",
        intent: "Enable SSH v2, disable telnet, set 5 min timeout",
        generatedConfig: `! SSH Hardening\nno service telnet\nip ssh version 2\nip ssh time-out 300\nline vty 0 4\n transport input ssh\n exec-timeout 5 0\n login local`,
        deviceType: "ROUTER" as const,
        platform: "Cisco IOS",
        tags: ["SSH", "Security", "Management"],
      },
    ];

    for (const config of sampleConfigs) {
      await prisma.savedConfig.create({
        data: { userId: adminUser.id, ...config },
      });
    }
    console.log("✅ Sample configs created");
  }

  console.log("\n🎉 Seeding complete!\n");
  console.log("Demo accounts:");
  console.log("  admin@netops.dev    / admin123   (ADMIN)");
  console.log("  senior@netops.dev   / senior123  (SENIOR_ENGINEER)");
  console.log("  junior@netops.dev   / junior123  (JUNIOR_ENGINEER)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
