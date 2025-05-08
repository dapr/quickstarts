
from dataclasses import dataclass
from typing import List
import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@dataclass
class WordLength:
    word: str
    length: int

@wf_runtime.workflow(name='fanoutfanin_workflow')
def fanoutfanin_workflow(ctx: wf.DaprWorkflowContext, words: List[str]):
    tasks = [
        ctx.call_activity(get_word_length, input=word) for word in words
    ]
    all_word_lengths = yield wf.when_all(tasks)
    sorted_word_lengths = sorted(all_word_lengths, key=lambda x: x.length)
    shortest_word = sorted_word_lengths[0]
    return shortest_word.word

@wf_runtime.activity(name='get_word_length')
def get_word_length(ctx: wf.WorkflowActivityContext, word: str) -> WordLength:
    print(f'get_word_length: Received input: {word}.', flush=True)
    return WordLength(word=word, length=len(word))