import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = "localhost"; // Default to localhost

  // Find the local IPv4 address
  for (const interfaceName in networkInterfaces) {
    // Skip virtual and WSL adapters
    const lowerName = interfaceName.toLowerCase();
    if (
      lowerName.includes("wsl") ||
      lowerName.includes("vethernet") ||
      lowerName.includes("virtual") ||
      lowerName.includes("vmware") ||
      lowerName.includes("hyper-v")
    ) {
      continue;
    }

    const interfaces = networkInterfaces[interfaceName];
    if (interfaces) {
      for (const iface of interfaces) {
        // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        if (iface.family === "IPv4" && !iface.internal) {
          ipAddress = iface.address;
          break;
        }
      }
    }
    if (ipAddress !== "localhost") {
      break;
    }
  }

  return NextResponse.json({ ipAddress });
}
