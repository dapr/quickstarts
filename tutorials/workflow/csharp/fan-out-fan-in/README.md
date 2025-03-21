# Fan-out/Fan-in

This tutorial demonstrates how to author a workflow where multiple independent tasks can be scheduled and executed simultaneously. The workflow can either wait until all tasks are completed, or when the fastest task is completed. For more information about the fan-out/fan-in pattern see the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/workflow/workflow-patterns/#fan-outfan-in).

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/fan-out-fan-in` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build ./FanOutFanIn/
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    ```bash
    dapr run -f .
    ```

4. Use the POST request in the [`fanoutfanin.http`](./fanoutfanin.http) file to start the workflow.
5. Use the GET request in the [`fanoutfanin.http`](./fanoutfanin.http) file to get the status of the workflow.
6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
