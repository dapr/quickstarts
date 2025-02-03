import express from "express";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Start server
const appPort = process.env.APP_PORT || "6200";
app
  .listen(appPort, () => {
    console.log(`Server started on port ${appPort}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

function setDroidJob(droidStr) {
  const [droid, task] = droidStr.split(":");

  return {
    droid,
    task,
  };
}

// Job handler route
app.post("/job/*", (req, res) => {
  console.log("Received job request...");

  try {
    const jobData = req.body;

    // Creating Droid Job from decoded value
    const droidJob = setDroidJob(jobData.value);

    console.log("Starting droid:", droidJob.droid);
    console.log("Executing maintenance job:", droidJob.task);
    res.status(200).end();
  } catch (error) {
    console.error("Error processing job:", error);
    res.status(400).json({
      error: `Error processing request: ${error.message}`,
    });
  }
});
