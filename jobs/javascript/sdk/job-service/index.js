import { DaprServer } from "@dapr/dapr";

const daprHost = process.env.DAPR_HOST || "http://localhost";
const daprPort = process.env.DAPR_HTTP_PORT || "6280";
const serverPort = process.env.APP_PORT || "6200";

async function main() {
  const server = new DaprServer({
    serverHost: "127.0.0.1",
    serverPort,
    clientOptions: { daprHost, daprPort },
  });

  for (const name of ["R2-D2", "C-3PO", "BB-8"]) {
    await server.jobs.listen(name, async (data) => {
      console.log("Received job request...");
      console.log("Starting droid:", data.droid);
      console.log("Executing maintenance job:", data.task);
    });
  }

  await server.start();
}

main().catch((error) => {
  console.error("Job service failed:", error);
  process.exit(1);
});
