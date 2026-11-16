import { DaprClient } from "@dapr/dapr";

const daprHost = process.env.DAPR_HOST || "http://localhost";
// Jobs belong to the app whose sidecar receives the scheduling request.
const jobServiceDaprHttpPort = "6280";

async function main() {
  const client = new DaprClient({
    daprHost,
    daprPort: jobServiceDaprHttpPort,
  });
  await client.start();

  const jobs = [
    { name: "R2-D2", dueTime: "15s", task: "Oil Change" },
    { name: "C-3PO", dueTime: "20s", task: "Limb Calibration" },
    { name: "BB-8", dueTime: "60s", task: "Gyroscope Check" },
  ];

  for (const { name, dueTime, task } of jobs) {
    await client.jobs.schedule(name, {
      dueTime,
      data: { droid: name, task },
      overwrite: true,
    });
    console.log("Job scheduled:", name);

    const job = await client.jobs.get(name);
    console.log(
      `Job retrieved: ${job.name}, due in ${job.dueTime}, droid: ${job.data.droid}, task: ${job.data.task}`
    );
  }

  await client.jobs.delete("BB-8");
  console.log("Job deleted: BB-8");
}

main().catch((error) => {
  console.error("Job scheduler failed:", error);
  process.exit(1);
});
