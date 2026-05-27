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
- current-week focus
- weak areas
- initial progress state

The current implementation uses local rule scoring. Future AI scoring should preserve the same output shape.

## Adaptive Daily Plan

Daily workload is not a fixed global number and should not be generated as a full long-term schedule in advance.

Sentence count rule:

- Primary-junior: weeks 1-2 start at 3 real scenes per day.
- High-school: weeks 1-2 start at 5 real scenes per day.
- Every two weeks, add 1 real scene per day.
- Stop increasing at 10 real scenes per day.

Weekly adjustment rule:

- Use recent completion reports, active unknown words, and repeated mistakes to classify the current week as support, steady, or stretch.
- Support mode keeps the planned sentence count but makes the next tasks clearer and recycles weak points.
- Stretch mode keeps the planned sentence count but asks for more natural transfer or sentence upgrading.
- The scene pool strategy and vocabulary scope remain owned by the existing learning version data; weekly planning must not bypass them.

Only the current week and next immediate focus should be calculated. Do not pre-fill every future week.

Scenario order must be learner-adaptive:

- Day 1 starts with a placement bridge scenario tied to the learner's first-login result.
- Later days start with review-first behavior: warm-up from the previous report, then a first scene that reuses yesterday's words, grammar, or mistake pattern.
- New scenes come only after that review bridge.
- The base scene pools and vocabulary scope remain intact; adaptation reorders and prepends bridges instead of replacing the whole curriculum.

Daily summaries must create actionable review data:

- words to actively reuse
- grammar patterns with simple examples
- first prompt for tomorrow's review
- new-scene focus after review
- direct route into vocabulary review even when the automatic threshold has not been reached

Daily vocabulary target rule:

- Each day has an explicit target-word window built from the planned sentence scenes.
- These target words are required learning goals, not optional lookup history.
- After the daily sentence scenes, run a mixed Chinese-English check before the learner can continue to the next day.
- Daily target words, source sentences, and quiz prompts should include English audio playback.
- Early checks should be light: English-to-Chinese recognition and Chinese-to-English spelling with hints.
- The summary should make the achievement visible so the learner knows exactly what was learned today.

## Local Learner Access

Local learner profiles are separate learning accounts on the same browser.

Current MVP rule:

- Progress is saved by learner profile id and learning version.
- New learner profiles require a local access code.
- Switching into a protected profile requires the local access code.
- This prevents casual mis-selection on a shared device, but it is not full cloud authentication.

Future cloud account rule:

- Replace the local guard with real Auth and server-side ownership checks.
- Keep complete personal answers private by default.
- Team sharing should publish only explicit progress snapshots or opted-in interaction cards.

## Copilot Window

The Copilot is the unified learning interaction window, not a generic support chatbot.

Core rules:

- The learner may type Chinese or English.
- If the learner types Chinese, the first action is to translate the learner's intent into simple English.
- The reply should then continue in English at the learner's current level.
- The Copilot should help with word lookup, sentence rewriting, scenario explanation, pronunciation hints, task clarification, and gentle feedback.
- The Copilot should avoid grammar-label-first explanations unless the learner asks for them.
- The Copilot should keep the learner inside the current learning flow instead of opening many separate tools.
- The Copilot must appear during scenes, warm-up review, and daily summary because low-vocabulary learners may need help understanding the prompt itself.

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
