---
title: Put the boring half of your agent in code
excerpt: 'After building a couple dozen agent workflows against live systems, I keep coming back to the same boundary: scripts should gather and verify the facts, while models should interpret them.'
publishDate: 'Aug 15 2026'
featureImage:
  src: '/darkest2.jpeg'
  alt: Adventurers fighting monsters
  caption: Adventurers fighting monsters
seo:
  image:
    src: '/darkest2.jpeg'
---

I have built roughly twenty-five AI agent workflows against live systems over the past five months. Some of them have been useful. Some have produced answers that looked reasonable until I checked them against another source.

The useful ones all ended up with the same shape:

> Put the boring, mechanical work in a script. Give the model a small, checked set of facts to interpret.

The distinction matters because a naive agent spends a surprising amount of its context window doing work that has one correct answer. It calculates date ranges, follows pagination, looks up identifiers, filters records, and adds numbers together. It then has less context and less attention left for the part where a model is actually useful: deciding whether something matters and what someone should do about it.

## Start with a failure

One of my gatherers was reporting cloud spend by vendor and model. It looked plausible. The numbers were wrong.

The provider split charges across several per-model line items, while the gatherer filtered for the obvious aggregate service name. That aggregate line was only a small part of the real spend. The result undercounted usage by more than an order of magnitude.

There was no obvious error. The API call worked. The response parsed. The output was formatted correctly. A plausibility check would not have caught it because the wrong number was still a believable number.

I found the problem by comparing the result with an independent billing source, then running that comparison repeatedly until the gap was clear. The fix was partly code and partly documentation: match the actual line items, preserve the raw categories, and record why the filter exists so nobody simplifies it later.

That incident changed how I divide up agent workflows.

## The boundary

The script should handle things such as:

- Date and time calculations
- Pagination and retries
- Identifier resolution
- Filtering and mechanical exclusions
- Aggregation and unit conversion
- Parsing stable formats
- Schema validation
- Independent cross-checks
- Explicit reporting of missing or inaccessible data

The model should handle things such as:

- Deciding whether a change is meaningful
- Explaining a likely cause
- Prioritizing findings
- Separating signal from noise when the rules are not mechanical
- Recommending what someone should do next

The output between the two should be small enough to inspect. For example:

```json
{
  "window": {
    "start": "2026-08-01",
    "end": "2026-08-08"
  },
  "changes": [
    {
      "kind": "spend",
      "vendor": "example-provider",
      "current": 1420.25,
      "previous": 913.10,
      "source": "billing-api",
      "validated_against": "invoice-export"
    }
  ],
  "unknowns": [
    "3 invoices contain amounts only in attachments"
  ]
}
```

The model does not need the provider's full response. It needs to decide whether the change is real, whether it matters, and whether anyone needs to act. The script has already done the work that should not change from one run to the next.

This is not about removing the model from the workflow, but rather about giving it a narrower job.

## The line moves as you learn the system

I started with a simpler idea: scripts would fetch data and models would do the analysis. That boundary did not survive contact with real systems.

### Calculate the shape before asking for an explanation

A vendor's invoice history included thirteen monthly invoices and one large annual commitment. A naive recent-versus-prior comparison treated the annual commitment as a monthly spike and reported a dramatic trend.

The correct fix was not a longer prompt. The gatherer now computes the monthly trend, exposes annual commitments separately, and documents that the categories must not be added together.

The model can explain a trend. It should not be responsible for deciding which invoices belong in the trend in the first place.

### Preserve the model's decisions

One monitoring workflow records each alert with a state such as `chronic-accepted`, `suspected-bad-threshold`, or `confirmed-real-issue`.

The model decides which state fits. The script stores that decision. Next week's run does not need to ask the model to reconsider the same 96 alerts from scratch.

This is a useful inversion. The script is not only feeding the model. It is also remembering what the model decided, along with enough context to revisit that decision later.

### Report absence explicitly

A missing value is not the same as zero. No datapoints is not the same as no activity. A section that is missing from a document is not the same as a section that says there was nothing to report.

One gatherer found five invoices with null amounts. The first version turned that into an empty vendor total. The useful answer was different: the amounts might exist in attachments that the current parser could not read.

If a workflow cannot say 'I do not know', it will eventually say 'nothing' when it should not.

## Production systems lie in specific ways

Documentation tells you how an API is supposed to behave. It does not tell you all the ways the system will produce a plausible answer that is wrong.

A few examples from these workflows:

- A metrics API returned zero datapoints for a real, bursty workload when queried over 30 days. Querying each day and summing the results found the activity.
- A version parser greedily matched a date suffix and silently reported an unmapped cost. The corrected regex now has a comment explaining the negative lookahead, because someone will otherwise simplify it later.
- A roster of people written as bare names matched zero rows. The API required full email addresses.
- Reserved-instance fees posted as a lump sum on the first of the month, making a database service look like it had jumped week over week.

None of these cases were especially exotic. They were just invisible in the happy path. Each one was found because an answer looked wrong, or because the result was checked against something independent.

The durable asset is the record of these traps. It should include the symptom, the case that exposed it, the fix, and the check that prevents the same mistake from coming back.

That record is more valuable than a clever prompt. It is also more useful than a generic script that has never seen your systems.

## An unrun workflow is a broken workflow

The least flattering failure I found was not in an API response. It was in a scheduled job.

A digest ran three times a day. Its log contained 138 consecutive failures and no successes because the scheduler's environment did not have a command that the script used. The job had been firing for about two and a half months. Nobody noticed because the last successful run had been manual, and that manual check stopped on June 1.

The useful part of the workflow was me typing a command. The automation produced nothing into a log nobody read.

A scheduled workflow needs a visible success signal and a useful failure path. Otherwise, 'scheduled' only means that the machine will keep trying. It does not mean that anyone is receiving the result.

The same pattern applies to state. A suppression file that someone was supposed to prune every week had not been updated in five months. Machine-maintained state files, updated as a side effect of the workflow, were still current.

State that updates as part of normal use tends to survive. State that requires a separate act of discipline tends not to.

## How I apply the pattern now

When I start a new agent workflow, I try to do this in order:

1. Write down the question the workflow should answer.
2. List the facts needed to answer it.
3. Move dates, IDs, pagination, filtering, aggregation, and validation into code.
4. Define a small output schema with sources and explicit unknowns.
5. Give the model the job of interpreting, prioritizing, or recommending.
6. Persist useful model decisions so the next run has history.
7. Add an independent check for any number someone might make a decision from.
8. Run the workflow the way it will run in production, not only from an interactive terminal.

The code does not need to be elaborate. In many cases, a small Python script and a JSON file are enough. The important thing is to make the boundary obvious.

The same split works outside cloud infrastructure. An incident retrospective can gather the timeline from alerts, deploys, and chat, then leave contributing-factor analysis to the model. A vendor review can gather renewal dates and spend, then ask whether the contract still makes sense. Compliance evidence collection and onboarding context maps have the same shape.

The code will not transfer perfectly between these systems. The knowledge about how each system lies might.

That is the part I would share across a team: a dated, explained record of the traps we have found. If everyone independently rediscovers that a billing line undercounts spend, the team is paying for the same lesson many times.

If you are building an agent against your own systems, start with the boring half. Make the facts repeatable, make uncertainty visible, and give the model a small question to answer. Then run the workflow often enough to find out where your systems lie.

---

*The deterministic gather pattern is simple: code should gather and check the evidence, while the model should interpret it. The hard part is learning which details in your systems cannot be trusted without a check.*

