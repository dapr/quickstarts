using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapr.Workflow;
using ChildWorkflows.Activities;

namespace ChildWorkflows;

internal sealed class ParentWorkflow : Workflow<string[], string[]>
{
    public override async Task<string[]> RunAsync(WorkflowContext context, string[] input)
    {
         List<Task<string>> childWorkflowTasks = new();

         foreach (string item in input)
         {
             childWorkflowTasks.Add(context.CallChildWorkflowAsync<string>(
                 nameof(ChildWorkflow),
                 item));
         }

        var allChildWorkflowResults = await Task.WhenAll(childWorkflowTasks);

        return allChildWorkflowResults;
    }
}
