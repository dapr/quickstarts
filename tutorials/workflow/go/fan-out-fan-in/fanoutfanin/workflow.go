package main

import (
	"fmt"

	"github.com/dapr/durabletask-go/workflow"
)

// WordLength is the result of the GetWordLength activity.
type WordLength struct {
	Word   string `json:"word"`
	Length int    `json:"length"`
}

// FanOutFanInWorkflow shows the fan-out/fan-in pattern. It schedules one
// GetWordLength activity for each word of the input. The activities run at the
// same time (fan-out). The workflow then waits until all of them are complete
// (fan-in) and returns the shortest word.
// Workflow code must be deterministic. Write any non-deterministic behavior
// inside activities.
func FanOutFanInWorkflow(ctx *workflow.WorkflowContext) (any, error) {
	var words []string
	if err := ctx.GetInput(&words); err != nil {
		return nil, err
	}

	// Fan-out: CallActivity schedules an activity and returns a task at once.
	// It does not wait for the activity to finish.
	tasks := make([]workflow.Task, 0, len(words))
	for _, word := range words {
		tasks = append(tasks, ctx.CallActivity(GetWordLength, workflow.WithActivityInput(word)))
	}

	// Fan-in: Await blocks until a task is complete. When the loop ends,
	// all the tasks are complete.
	var shortest *WordLength
	for _, task := range tasks {
		var wl WordLength
		if err := task.Await(&wl); err != nil {
			return nil, err
		}
		if shortest == nil || wl.Length < shortest.Length {
			shortest = &wl
		}
	}
	if shortest == nil {
		return nil, fmt.Errorf("the input has no words")
	}

	return shortest.Word, nil
}

// GetWordLength returns the length of a word.
// The argument (ctx) is the workflow.ActivityContext. It gives access to the
// input of the activity with ctx.GetInput.
func GetWordLength(ctx workflow.ActivityContext) (any, error) {
	var word string
	if err := ctx.GetInput(&word); err != nil {
		return nil, err
	}
	fmt.Printf("get_word_length: Received input: %s.\n", word)
	return WordLength{Word: word, Length: len(word)}, nil
}
