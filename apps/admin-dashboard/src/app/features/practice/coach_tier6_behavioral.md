# ⚫ Tier 6 — Behavioral & Manager Questions

> Not about code. About you as a professional. These come from non-technical managers and HR screens. Answer in 1–2 minutes max — story, not a lecture.
> ← Back to [main index](interview_coach_2026.md)

---

## 📋 Contents

1. [Tell me about yourself](#1-tell-me-about-yourself)
2. [Most complex feature you've built](#2-most-complex-feature-youve-built)
3. [How do you know when something is done?](#3-how-do-you-know-when-something-is-done)
4. [Unclear requirements — what do you do?](#4-unclear-requirements--what-do-you-do)
5. [Disagreed with a technical decision](#5-disagreed-with-a-technical-decision)
6. [Code review — giving and receiving](#6-code-review--giving-and-receiving)
7. [Bug that made it to production](#7-bug-that-made-it-to-production)
8. [Prioritising multiple tasks](#8-prioritising-multiple-tasks)
9. [What does "senior" mean to you?](#9-what-does-senior-mean-to-you)
10. [How do you onboard to a new codebase?](#10-how-do-you-onboard-to-a-new-codebase)
11. [How do you keep up with Angular?](#11-how-do-you-keep-up-with-angular)
12. [Helping a junior without giving the answer](#12-helping-a-junior-without-giving-the-answer)
13. [Where do you see yourself in 3 years?](#13-where-do-you-see-yourself-in-3-years)
14. [What are your weaknesses?](#14-what-are-your-weaknesses)
15. [Why are you leaving your current job?](#15-why-are-you-leaving-your-current-job)
16. [Your question for them](#16-your-question-for-them)

---

## 1. Tell me about yourself

### 🗣️ Spoken answer

> 2-minute story. Not your CV. Structure: who you are → what you've built → why you're here.

_"I'm a frontend developer with a focus on Angular. I've been building a full admin dashboard — user management, authentication, state management with NgRx SignalStore, reactive forms — using a modern stack: signals, zoneless change detection, an Nx monorepo. I care about clean architecture and things that are actually maintainable. I'm here because I want to bring that to a team working on real problems at scale."_

### What NOT to do

- Don't recite your CV chronologically
- Don't say "I'm a hard worker and a fast learner" — everyone says this
- Don't run longer than 2 minutes

### 🎤 Practice question

> _"So, tell me about yourself."_

---

## 2. Most complex feature you've built

### 🗣️ Spoken answer

> Pick one thing. Be specific — name the challenge, the decision, the result. Don't generalise.

_"The most complex was the user management section — it handles pagination, inline editing with clone-and-restore for cancel, role-based visibility, optimistic UI, and all state in a single SignalStore. The hard part was keeping the 'original' copy of a row while the user edits it, so cancel works correctly. I used `structuredClone` on the user object when editing starts, stored it in a map by ID, and restored from it on cancel. Getting that right without making the state shape unmanageable took some iteration."_

### 🎤 Practice question

> _"What's the most technically complex piece of work you've done?"_

---

## 3. How do you know when something is done?

### 🗣️ Spoken answer

> _"Done means: it works for the happy path and the obvious edge cases, it has a test for the logic that matters, it handles errors gracefully instead of silently failing, and someone else can read the code without asking me to explain it. If there's an acceptance criteria, it matches that. I don't gold-plate — if a feature is clear and tested, it ships."_

### 🎤 Practice question

> _"What's your definition of done?"_

---

## 4. Unclear requirements — what do you do?

### 🗣️ Spoken answer

> _"I ask one focused question to unblock myself rather than waiting. I try to frame it as: 'I'm going to do X unless you tell me otherwise' — that respects people's time and shows initiative. If it's a bigger ambiguity, I build the simplest thing that could work, mark it as a decision point in the PR, and surface it in review rather than making a unilateral call on something that matters."_

### 🎤 Practice question

> _"How do you handle a task where the requirements aren't clear?"_

---

## 5. Disagreed with a technical decision

### 🗣️ Spoken answer

> _"I raise it once clearly with a specific reason — not 'I don't like it' but 'this will cause X problem when Y happens'. If the team decides to go a different way after hearing the tradeoffs, I commit and execute. I don't relitigate decisions that are already made. The only exception is something that's a security issue or will cause serious production harm — that I'd escalate."_

### 🎤 Practice question

> _"Have you ever disagreed with a decision your team made? What did you do?"_

---

## 6. Code review — giving and receiving

### 🗣️ Spoken answer

> _"When I give feedback I try to be specific and suggest a fix, not just flag a problem. And I distinguish between 'this must change' and 'this is what I'd do but it's a preference'. When I receive it I try to read the comment generously — assume they're trying to improve the code, not criticise me. If I disagree I explain why. If they're right I say so and fix it."_

### 🎤 Practice question

> _"How do you approach code reviews?"_

---

## 7. Bug that made it to production

### 🗣️ Spoken answer

> Pick something real, focus on the process not the blame.

_"We had a bug where a user action updated the wrong item in a list because we were mutating state directly instead of replacing it — OnPush didn't detect the change, so the UI was showing stale data. It slipped through because we were testing the happy path and not the edit-then-scroll scenario. Fix was immutable state updates everywhere. After that I added a specific test for 'state reference changes on update'. The lesson was: OnPush makes bugs like this invisible until real usage — you have to test for it."_

### 🎤 Practice question

> _"Tell me about a bug that made it to production. What happened and what did you do?"_

---

## 8. Prioritising multiple tasks

### 🗣️ Spoken answer

> _"I ask what's blocking other people first — unblocking teammates multiplies the team's output. After that: customer-facing bugs over features, features with hard deadlines over open-ended work. If everything genuinely looks equal I ask my lead to help triage rather than guess wrong. I also time-box — if I've spent an hour on something and I'm stuck, I move on and come back, rather than burning the whole day."_

### 🎤 Practice question

> _"You have three things to do at once. How do you prioritise?"_

---

## 9. What does "senior" mean to you?

### 🗣️ Spoken answer

> _"To me it means you own outcomes, not just tasks. A junior completes the ticket. A senior asks whether the ticket solves the right problem. It also means you make the people around you faster — through reviews, documentation, unblocking people — not just writing more code yourself. And you can work independently on ambiguous problems rather than needing everything specified upfront."_

### 🎤 Practice question

> _"What does being a senior developer mean to you?"_

---

## 10. How do you onboard to a new codebase?

### 🗣️ Spoken answer

> _"I start with the entry point — `main.ts`, `app.config.ts`, the routes — to understand how the app is composed. Then I find where data flows: where state lives, how HTTP calls are made, what the interceptors do. I look at one real feature end-to-end — from the route to the component to the store to the API call. After that I look at the tests — they document intent better than comments. I try to ship something small early so I understand the PR process and deployment pipeline."_

### 🎤 Practice question

> _"You join a team with a large existing codebase. How do you get up to speed?"_

---

## 11. How do you keep up with Angular?

### 🗣️ Spoken answer

> _"I follow the official Angular blog for releases — they publish a post for every major version with the actual changes. I use the release notes directly rather than relying on second-hand summaries. I try new APIs in side projects before using them in production. For the ecosystem I watch what Nx and the NgRx team publish because they're ahead of the curve on patterns."_

### 🎤 Practice question

> _"How do you stay current with Angular?"_

---

## 12. Helping a junior without giving the answer

### 🗣️ Spoken answer

> _"I ask them what they've already tried and where they think the problem is. That tells me whether they're stuck on the concept or the implementation. If it's the concept I explain it with a small isolated example — not in their code. If it's the implementation I ask guiding questions: 'what does the network tab show?', 'what is the value of X at that point?'. I want them to find the answer so they can repeat the process next time. I only give the answer directly when they're blocked on something genuinely outside their experience level and the time cost is too high."_

### 🎤 Practice question

> _"How do you mentor a junior developer without creating dependency on you?"_

---

## 13. Where do you see yourself in 3 years?

### 🗣️ Spoken answer

> They want to know if you'll stay and if you have direction — not a specific title.

_"I want to be the person on the team who can own a feature from architecture to delivery, and who makes the codebase better over time rather than just adding to it. I'm interested in growing into technical leadership — not necessarily management, but the kind of role where I'm setting patterns and helping others grow. I'd like that to happen here if the opportunity exists."_

### 🎤 Practice question

> _"Where do you see yourself in three years?"_

---

## 14. What are your weaknesses?

### 🗣️ Spoken answer

> Pick something real but not career-limiting. Show awareness and a mitigation strategy.

_"I can go too deep on a technical problem before surfacing it — I'll spend time trying to solve something myself when I should have asked a question earlier. I've been working on it by setting a personal time-box: if I've been stuck for more than 30–45 minutes, I write down what I've tried and ask. It's made me faster and it also means I have a clear summary ready when I do ask."_

### What NOT to say

- "I work too hard" — nobody believes it
- A real weakness that would disqualify you: "I miss deadlines", "I don't like teamwork"
- "I don't have any" — instant red flag

### 🎤 Practice question

> _"What's your biggest weakness?"_

---

## 15. Why are you leaving your current job?

### 🗣️ Spoken answer

> Never badmouth. Frame as moving toward something, not away from something.

_"I've learned a lot where I am and I'm proud of what I've built. I'm looking for a bigger scope — more complex problems, a stronger team to learn from, and a product I can stay with long-term and really grow with."_

### 🎤 Practice question

> _"Why are you leaving your current position?"_

---

## 16. Your question for them

> Always have one. It signals you're evaluating them too, not just hoping to be hired.

### Good questions

_"What does the first 90 days look like for this role — what would I be working on?"_

_"What's the biggest technical challenge the team is dealing with right now?"_

_"How does the team handle technical debt — is there dedicated time for it or does it happen alongside features?"_

_"What does growth look like here for someone in this role?"_

### What NOT to ask first

- Salary / benefits (let them bring it up or save for the offer stage)
- "How many vacation days do I get?"
- Anything you could have found on their website in 5 minutes

---
