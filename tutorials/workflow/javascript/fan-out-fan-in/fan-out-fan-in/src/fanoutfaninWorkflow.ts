import { Task, WorkflowActivityContext, WorkflowContext } from "@dapr/dapr";

interface WordLength {
  word: string;
  length: number;
}

/*
 * Fan-out/fan-in: the workflow schedules one activity for each word, without waiting for the result of each one.
 * The activities run at the same time. `ctx.whenAll` creates a task that completes when all of those tasks are completed.
 *
 * A workflow definition is a generator function. Each `yield` waits for the result of a task.
 * Workflow code must be deterministic. Any non-deterministic behavior should be written inside activities.
 */
export function* fanoutfaninWorkflow(ctx: WorkflowContext, words: string[]): Generator<Task<any>, string, any> {
  const tasks = words.map((word) => ctx.callActivity(getWordLength, word));
  const allWordLengths: WordLength[] = yield ctx.whenAll(tasks);
  const shortestWord = allWordLengths.reduce((shortest, current) => (current.length < shortest.length ? current : shortest));
  return shortestWord.word;
}

/*
 * An activity definition is a function. Dapr uses the function name as the activity name.
 * The first argument (`ctx`) is the `WorkflowActivityContext`.
 * The second argument (`input`) is the input parameter for the activity.
 */
export async function getWordLength(_ctx: WorkflowActivityContext, word: string): Promise<WordLength> {
  console.log(`getWordLength: Received input: ${word}.`);
  return { word, length: word.length };
}
