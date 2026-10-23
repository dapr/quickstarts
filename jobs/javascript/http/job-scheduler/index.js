// Job request bodies
const c3poJobBody = {
  data: {
    value: "C-3PO:Limb Calibration",
  },
  dueTime: "20s",
};

const r2d2JobBody = {
  data: {
    value: "R2-D2:Oil Change",
  },
  dueTime: "15s",
};
const daprHost = process.env.DAPR_HOST || "http://localhost";
const jobServiceDaprHttpPort = "6280";

async function main() {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // Wait for job-service to start
  await sleep(5000);

  try {
    // Schedule R2-D2 job
    await scheduleJob("R2-D2", r2d2JobBody);
    await sleep(5000);
    // Get R2-D2 job details
    await getJobDetails("R2-D2");

    // Schedule C-3PO job
    await scheduleJob("C-3PO", c3poJobBody);
    await sleep(5000);
    // Get C-3PO job details
    await getJobDetails("C-3PO");

    await sleep(30000);
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Request timed out");
    } else {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

async function scheduleJob(jobName, jobBody) {
  const reqURL = `${daprHost}:${jobServiceDaprHttpPort}/v1.0-alpha1/jobs/${jobName}`;
  const response = await fetch(reqURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobBody),
  });

  if (response.status !== 204) {
    throw new Error(
      `Failed to register job event handler. Status code: ${response.status}`
    );
  }

  console.log("Job Scheduled:", jobName);
}

async function getJobDetails(jobName) {
  const reqURL = `${daprHost}:${jobServiceDaprHttpPort}/v1.0-alpha1/jobs/${jobName}`;
  const response = await fetch(reqURL, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const jobDetails = await response.text();
  console.log("Job details:", jobDetails);
}

main().catch(console.error);
