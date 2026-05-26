# Product Loops

This document captures product rules that must guide future implementation. The app should remain scene-first, language-first, and learner-adaptive.

## First Login Placement

New learners should not start from a fixed Day 1.

The first session starts with three lightweight tasks:

1. Scene understanding: infer what a speaker really means in a realistic situation.
2. Natural rewrite: improve a Chinese-English expression into natural English.
3. Transfer expression: write one or two English sentences in a similar personal situation.

The result sets:

- learning version: primary-junior or high-school
- study pace: gentle, steady, or stretch
- first-week focus
- weak areas
- initial progress state

The current implementation uses local rule scoring. Future AI scoring should preserve the same output shape.

## Copilot Window

The Copilot is the unified learning interaction window, not a generic support chatbot.

Core rules:

- The learner may type Chinese or English.
- If the learner types Chinese, the first action is to translate the learner's intent into simple English.
- The reply should then continue in English at the learner's current level.
- The Copilot should help with word lookup, sentence rewriting, scenario explanation, pronunciation hints, task clarification, and gentle feedback.
- The Copilot should avoid grammar-label-first explanations unless the learner asks for them.
- The Copilot should keep the learner inside the current learning flow instead of opening many separate tools.

Feedback collection:

- Explicit feedback: user clearly reports a bug, asks for a feature, says something is confusing, too hard, too easy, boring, or useful.
- Pattern feedback: many learners repeatedly ask for the same help, avoid the same step, or request the same missing capability.

Product escalation:

- A single explicit bug or severe confusion should create a review item.
- Repeated feedback across learners should become a system optimization candidate.
- Optimization candidates should record source examples, affected learner levels, and suggested product change.

## Async Learning Teams

Learning teams are asynchronous. Learners do not need to start at the same time or study at the same time.

Team principles:

- Joining is voluntary through invite or request.
- Leaving is always allowed.
- Progress sharing is opt-in and layered.
- Full personal answers are private by default.
- Team visibility should encourage help and shared momentum, not shame.

Public team surfaces:

- today's completion status
- current milestone and first-week focus
- public weak-area tags
- optional help cards
- short fun sentence shares
- accepted peer challenges
- teammate support history

Interaction types:

- Help card: "I am stuck on this sentence. Can someone give a hint?"
- Challenge card: "I think this sentence can challenge B. Want to try it?"
- Fun short share: a funny, useful, or elegant English line from today's learning.
- Sentence rescue: teammates offer clearer or more natural versions.
- Group clinic: anonymized repeated mistakes become a shared mini task.

Competition and cooperation:

- Reward consistency, helpfulness, expression improvement, and accepted challenges.
- Avoid naked score ranking as the primary mechanic.
- Use group goals such as "the team collected 20 useful real-life expressions this week."

Future cloud data objects:

- Account
- LearnerProfile
- Team
- TeamMembership
- ProgressSnapshot
- HelpCard
- ChallengeCard
- FunShare
- FeedbackEvent
- OptimizationCandidate
