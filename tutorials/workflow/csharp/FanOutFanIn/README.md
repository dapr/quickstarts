# Fan-out/Fan-in

## Run the tutorial

1. Use a terminal to navigate to the `tutorials/workflow/csharp/FanOutFanIn` folder.
2. Build the project using the .NET CLI.

    ```bash
    dotnet build
    ```

3. Use the Dapr CLI to run the Dapr Multi-App run file

    ```bash
    dapr run -f .
    ```

4. Use the POST request in the [`fanoutfanin.http`](./fanoutfanin.http) file to start the workflow.
5. Use the GET request in the [`fanoutfanin.http`](./fanoutfanin.http) file to get the status of the workflow.
6. Stop the Dapr Multi-App run process by pressing `Ctrl+C`.
