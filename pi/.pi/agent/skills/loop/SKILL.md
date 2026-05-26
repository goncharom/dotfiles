---
name: loop
description: Polls a command or observable condition until it reaches a desired state, sleeping between checks, then continues with the requested follow-up work. Use when the user asks to wait for tests, builds, deploys, CI, background jobs, or any other status that should be re-checked until completion.
compatibility: Uses bash and sleep. Best when the condition can be checked from the CLI, local files, logs, or a simple network/API command available in the current environment.
---

# Loop

Run a simple blocking wait loop inside the current turn.

This skill is a dumb synchronous polling loop, not a scheduler or background task. Stay in the current request, re-check the condition, sleep, and continue once the relevant outcome is known.

## When to use

Use this skill when the user wants you to:

- wait for integration tests, CI, builds, deploys, or long-running scripts
- poll a status command until completion
- check back repeatedly until a state changes
- automatically continue with follow-up work once the wait is over

Examples:

- "wait for the integration tests to finish, then fix failures"
- "keep checking the deploy until it's live, then verify the health endpoint"
- "poll this background job every minute and tell me when it completes"

## Required inputs

Before starting, identify:

1. what condition means "done"
2. how to check it
3. what to do after it is done
4. the polling interval, if the user specified one

If the check command or success condition is unclear, ask a short clarifying question. If you can infer a safe check command from repo context or prior conversation, do so.

## Core workflow

1. Decide the check method.
   - Prefer the cheapest reliable check.
   - Reuse existing project commands, logs, status files, APIs, or CI tools.
2. Decide the sleep interval.
   - Use the user's interval if given.
   - Otherwise choose a reasonable interval based on expected duration and cost.
3. Loop:
   - run the check
   - interpret the result
   - if the success condition is met, stop waiting and do the requested follow-up work
   - if a terminal failure condition is met, stop and report it, unless the user asked you to wait for completion and then handle the result
   - otherwise sleep with `bash` using `sleep <seconds>` and check again
4. After completion, continue the rest of the user's request in the same turn.

## Interval guidance

Prefer short but not spammy intervals:

- 10-30s: local tests, short builds, something likely to finish soon
- 30-60s: CI jobs, remote checks, medium builds
- 1-5m: deploys, long remote jobs, low-signal polling

Round to simple values like `15`, `30`, `60`, or `120` seconds.

## Guardrails

- Do not use this as a background scheduler. This skill blocks the current turn.
- Briefly tell the user what you are waiting for if the wait may take noticeable time.
- Set a reasonable maximum wait when the user does not specify one.
  - Default to about 10 minutes for local commands and about 30 minutes for remote systems, unless context strongly suggests otherwise.
- If the maximum wait is reached, report the current status and ask whether to continue.
- If the check command has side effects, find a read-only alternative before looping.
- If the status can be streamed or tailed more efficiently than polling, prefer that approach over repeated sleep/check cycles when appropriate.
- Keep each loop iteration lightweight.

## Bash usage

Use `bash` for both the checks and the sleep.

Examples:

```bash
sleep 15
sleep 60
```

When helpful, combine check and normalization logic in one shell command so the result is easy to interpret.

## Result handling

When the condition becomes true:

1. summarize briefly what changed
2. perform the requested next action
3. report the final outcome

If the condition finishes in a failed state:

- diagnose or perform the user's requested failure handling if they asked for it
- otherwise report the failure clearly and stop

## Completion checklist

Before finishing, verify:

- you used a read-only check where possible
- the polling interval was explicit or reasonably chosen
- you stopped looping once the relevant outcome was known
- you either completed the requested follow-up work or clearly reported why you could not
