import type { Lesson } from './types';

export const lessons: Lesson[] = [
  {
    id: 'hotdog',
    title: 'Is a hotdog a sandwich?',
    subtitle: 'Settle the everlasting debate with a Noul',
    primitive: 'Noul',
    icon: '🌭',
    steps: [
      {
        title: 'Your first question',
        body: [
          'Every request has three parts: a [[state]] (what to look at), a model, and one or more typed questions.',
          'A [[noul]] is the simplest question type: a yes/no question. Instead of `true` or `false`, you get back the **probability that the answer is yes**.',
          'Press **Run** and look at the response.',
        ],
        request: {
          state: 'A hotdog: a grilled sausage served in a sliced bun.',
          questions: {
            is_sandwich: { type: 'noul', instructions: 'Is this food a sandwich?' },
          },
        },
        notice: [
          'The answer is a number between 0 and 1, not a boolean. Your code decides where to draw the line.',
          'A value near 0.5 means the model finds the question genuinely ambiguous. For this question, that is the honest answer.',
          'Noul answers have no `confidence` field. The value itself tells you how sure the model is.',
        ],
        tryThis: ['Change the state to "Two slices of bread with ham and cheese between them."'],
      },
      {
        title: 'Define what yes and no mean',
        body: [
          'Most disagreements are really about definitions. A noul accepts optional [[criteria]] that spell out what a yes and a no mean.',
          'Here we adopt a broad definition of "sandwich". The state is unchanged.',
        ],
        request: {
          state: 'A hotdog: a grilled sausage served in a sliced bun.',
          questions: {
            is_sandwich: {
              type: 'noul',
              instructions: 'Is this food a sandwich?',
              criteria: {
                true: 'Any filling served inside bread or a split roll counts as a sandwich.',
                false: 'The food has no bread or roll holding the filling.',
              },
            },
          },
        },
        notice: [
          'The same state now gets a very different answer. You changed the rubric, not the model.',
          'This is the main lever you have: put your domain rules into instructions and criteria.',
        ],
        tryThis: [
          'Make the criteria strict: true = "Exactly two separate slices of bread", false = "Anything else, including a single hinged roll".',
        ],
      },
      {
        title: 'Point at parts of a structured state',
        body: [
          'State can be a JSON object. Name each piece, then refer to a field in your instructions using backticks, like `food`.',
          'Here we ask about three foods at once. Each question is independent, and they all see the same state.',
        ],
        request: {
          state: {
            food: 'Hotdog: a grilled sausage in a single hinged bun',
            other_food: 'Taco: seasoned beef folded inside a corn tortilla',
            dessert: 'Ice cream sandwich: vanilla ice cream between two chocolate wafers',
          },
          questions: {
            hotdog_is_sandwich: { type: 'noul', instructions: 'Is `food` a sandwich?' },
            taco_is_sandwich: { type: 'noul', instructions: 'Is `other_food` a sandwich?' },
            dessert_is_sandwich: { type: 'noul', instructions: 'Is `dessert` a sandwich?' },
          },
        },
        notice: [
          'Three answers come back in one response, each under the [[question-id]] you chose.',
          'Compare the three values. The model ranks them in an order that makes sense, even though none is a clear-cut case.',
        ],
        tryThis: ['Add a fourth field `burrito` and a question about it.'],
      },
      {
        title: 'Check yourself: ask the opposite',
        body: [
          'Calibrated probabilities should be consistent with each other. If you ask a question and its negation, the two answers should add up to about 1.',
          'This is the idea behind self-consistency checks: when two framings disagree, send the case to a human.',
        ],
        request: {
          state: 'A hotdog: a grilled sausage served in a sliced bun.',
          questions: {
            is_sandwich: { type: 'noul', instructions: 'Is this food a sandwich?' },
            is_not_sandwich: {
              type: 'noul',
              instructions: 'Is this food something other than a sandwich?',
            },
          },
        },
        notice: [
          'Add the two values together. A total close to 1.0 means the model is being consistent.',
          'A total far from 1.0 tells you something too: the question wording is ambiguous.',
        ],
      },
    ],
  },
  {
    id: 'sky',
    title: 'What color is the sky?',
    subtitle: 'Go beyond blue with a Choice',
    primitive: 'Choice',
    icon: '🌤️',
    steps: [
      {
        title: 'Pick one option',
        body: [
          'A [[choice]] question picks one option from a set you define. The options are the keys of `criteria`. Use `null` when an option needs no description.',
        ],
        request: {
          state: 'It is noon on a clear, cloudless summer day in Arizona.',
          questions: {
            sky_color: {
              type: 'choice',
              instructions: 'What color is the sky?',
              criteria: { blue: null, grey: null, orange: null, black: null },
            },
          },
        },
        notice: [
          '`choice` is the option with the highest probability.',
          '`probabilities` gives every option a share, and the shares sum to 1. These numbers are the real output; `choice` is just the top one.',
          '[[confidence]] summarises how concentrated those probabilities are. Here it should be high.',
        ],
      },
      {
        title: 'When the answer is unclear',
        body: [
          'Now the state is genuinely ambiguous. A good decision model should **say so** rather than guess with false certainty.',
        ],
        request: {
          state:
            'The sun is setting over the ocean while a dark storm front rolls in from the west.',
          questions: {
            sky_color: {
              type: 'choice',
              instructions: 'What color is the sky?',
              criteria: { blue: null, grey: null, orange: null, black: null },
            },
          },
        },
        notice: [
          'The probability is now spread across several options, and confidence drops.',
          'Low confidence is a feature, not a failure. In code, it is your signal to ask a human or gather more context.',
          'Open **How to read this** on the answer to see confidence worked out from these probabilities.',
        ],
        tryThis: ['Add "It is 30 minutes after sunset." to the state and rerun.'],
      },
      {
        title: 'Describe options with a rubric',
        body: [
          'Option names alone leave room for interpretation. Give each option a [[rubric]] description, and add an escape-hatch option for cases that fit none of them.',
        ],
        request: {
          state:
            'The sun is setting over the ocean while a dark storm front rolls in from the west.',
          questions: {
            dominant_sky_color: {
              type: 'choice',
              instructions: 'Which color dominates most of the visible sky?',
              criteria: {
                blue: 'Daytime clear sky; blue covers most of the view',
                grey: 'Overcast or storm clouds cover most of the view',
                warm: 'Sunrise or sunset tones (orange, pink, red) dominate',
                dark: 'Night, or the sky is almost black',
                mixed: 'No single color covers most of the sky',
              },
            },
          },
        },
        notice: [
          'Changing the question to "dominates", with clear descriptions, often sharpens the distribution.',
          'The `mixed` option gives the model an honest place to put its probability.',
        ],
      },
    ],
  },
  {
    id: 'monkey-art',
    title: 'Can monkeys create art?',
    subtitle: 'A real-life court case, rated with a Score',
    primitive: 'Score',
    icon: '📷',
    steps: [
      {
        title: 'Rate on a scale',
        body: [
          'A [[score]] rates the state against **ordered** levels that you define, lowest first. Use it when answers have a natural order: how much, how severe, how strong.',
          'The state describes the "monkey selfie" case (Naruto v. Slater, 9th Cir. 2018).',
        ],
        request: {
          state: {
            facts:
              'In 2011 photographer David Slater left his camera unattended on a tripod in an Indonesian reserve. A crested macaque named Naruto picked it up and pressed the shutter, taking several selfies. Slater published them. In 2015 PETA sued on Naruto’s behalf, claiming the macaque owned the copyright.',
            outcome:
              'The Ninth Circuit held in 2018 that animals have no standing to sue under the Copyright Act. The U.S. Copyright Office states that works produced by animals cannot be registered.',
          },
          questions: {
            monkey_authorship: {
              type: 'score',
              instructions:
                'How strongly do the facts support treating the macaque as the creative author of the photo?',
              criteria: ['Not at all', 'Weakly', 'Moderately', 'Strongly'],
            },
          },
        },
        notice: [
          '`score` is the **probability-weighted average** of the levels, so it can land between them (for example 0.4).',
          '`legend` maps each level number back to its description. `probabilities` shows how much weight each level got.',
          'The level numbers start at 0. With four levels, the score runs from 0 to 3.',
        ],
      },
      {
        title: 'Descriptive levels beat bare labels',
        body: [
          'Labels like "Weakly" or "Strongly" leave a lot open to interpretation. Describe what each level **looks like**. A good rubric is the biggest quality lever for a Score.',
        ],
        request: {
          state: {
            facts:
              'In 2011 photographer David Slater left his camera unattended on a tripod in an Indonesian reserve. A crested macaque named Naruto picked it up and pressed the shutter, taking several selfies. Slater published them.',
          },
          questions: {
            creative_control: {
              type: 'score',
              instructions:
                'How much deliberate creative control did the macaque exercise over the photo?',
              criteria: [
                'None: the photo was an accident of touching the camera',
                'Minimal: repeated button presses, but no evident aim or framing',
                'Some: evidence of noticing the lens or repeating a pose',
                'Substantial: deliberate framing, timing and subject selection',
              ],
            },
          },
        },
        notice: [
          'Compare the probability spread with the previous step. Well-defined levels usually concentrate the probability on fewer levels.',
        ],
        tryThis: ['Swap the criteria for ["Low", "Medium", "High"] and compare the confidence.'],
      },
      {
        title: 'Break a big judgment into small ones',
        body: [
          '"Is this art?" is too broad to answer well as one question. Split it into small, independent questions and **combine them in your own code** with weights you control. This is the **composite scoring** pattern.',
        ],
        request: {
          state: {
            facts:
              'In 2011 photographer David Slater left his camera unattended on a tripod in an Indonesian reserve. A crested macaque named Naruto picked it up and pressed the shutter, taking several selfies. Slater had set up the equipment, chose the location and later selected and edited the images.',
          },
          questions: {
            human_setup: {
              type: 'score',
              instructions: 'How much did a human set up the conditions for the photo?',
              criteria: ['None', 'Some', 'Most of it', 'All of it'],
            },
            animal_intent: {
              type: 'score',
              instructions: 'How much intent did the animal show in taking the photo?',
              criteria: ['None', 'Some', 'Clear intent'],
            },
            human_selection: {
              type: 'noul',
              instructions: 'Did a human choose, edit or publish the final image?',
            },
          },
        },
        notice: [
          'Each answer is narrow, so it is easier to check and to explain.',
          'For example, your code could compute `authorship = 0.5·human_setup/3 + 0.3·human_selection + 0.2·(1 − animal_intent/2)` and apply your own policy to the result.',
        ],
      },
    ],
  },
  {
    id: 'structured-state',
    title: 'Structured state',
    subtitle: 'Give the model a case file, not a paragraph',
    primitive: 'Concept',
    icon: '🗂️',
    steps: [
      {
        title: 'A plain string',
        body: [
          'The simplest [[state]] is a string, which works well for a single message or passage.',
        ],
        request: {
          state: 'I was charged twice for order A-104. Please refund the duplicate.',
          questions: {
            wants_refund: { type: 'noul', instructions: 'Is the customer asking for a refund?' },
          },
        },
        notice: [
          'Fine for one piece of text. But what if the decision needs a policy and an order record as well?',
        ],
      },
      {
        title: 'A case file as an object',
        body: [
          'Put related information together in one JSON object, with descriptive keys. Think of it as the folder you would hand to a panel of experts before asking them to decide.',
        ],
        request: {
          state: {
            ticket: {
              subject: 'Duplicate charge',
              messages: [
                {
                  from: 'customer',
                  text: 'I was charged twice for order A-104. Please refund the duplicate.',
                },
                { from: 'support', text: 'We are checking the charges.' },
              ],
            },
            order: {
              id: 'A-104',
              charges: [
                { amount_usd: 49, status: 'captured' },
                { amount_usd: 49, status: 'captured' },
              ],
            },
            refund_policy: 'Duplicate charges are eligible for a refund.',
          },
          questions: {
            wants_refund: { type: 'noul', instructions: 'Did the customer request a refund?' },
            duplicate_confirmed: {
              type: 'noul',
              instructions: 'Does `order.charges` show the same amount captured more than once?',
            },
            policy_allows: {
              type: 'noul',
              instructions: 'Does `refund_policy` support refunding this request?',
            },
          },
        },
        notice: [
          'Questions point at nested fields like `order.charges` using backticks.',
          'Each check is separate, so your code can require all three before it issues a refund.',
        ],
        tryThis: ['Change the second charge to `"status": "voided"` and rerun.'],
      },
      {
        title: 'Arrays for sequences',
        body: ['An array suits ordered things, such as chat turns or log lines.'],
        request: {
          state: [
            'Hi, I need help with my account.',
            'My customer number is TS1337.',
            'Actually never mind, I figured it out. Thanks!',
          ],
          questions: {
            still_needs_help: { type: 'noul', instructions: 'Does the customer still need help?' },
          },
        },
        notice: ['The model reads the whole sequence. The last message changes the answer.'],
      },
    ],
  },
  {
    id: 'structured-instructions',
    title: 'Structured instructions',
    subtitle: 'Pass data along with the question',
    primitive: 'Concept',
    icon: '🧩',
    steps: [
      {
        title: 'Instructions can be objects',
        body: [
          'Sometimes the question needs its own reference data. [[instructions]] can be an object: put the question in one field and the data in the others, then refer to the data by name in backticks.',
          'This keeps the state about the **thing being judged**, while each question carries its own reference data.',
        ],
        request: {
          state: {
            resume:
              'JOHN A. SMITH — Oakland, CA. Senior Software Engineer at Google (2019–2024). Previously at Square. BS Computer Science, UC Berkeley.',
          },
          questions: {
            same_person: {
              type: 'noul',
              instructions: {
                potential_duplicate: {
                  name: 'John Smith',
                  location: 'Oakland, California',
                  last_employer: 'Google',
                },
                question: 'Is the resume for the same person as `potential_duplicate`?',
              },
            },
          },
        },
        notice: [
          'The question names `potential_duplicate`, and the model finds it in the instructions object.',
        ],
        tryThis: ['Change `last_employer` to "Meta" and rerun.'],
      },
      {
        title: 'Criteria can be structured too',
        body: [
          'Option descriptions and level descriptions can also be objects. This is useful when each option carries attributes, such as a product catalogue or a set of tools.',
        ],
        request: {
          state: 'I need something to keep my coffee hot on a 6-hour hike.',
          questions: {
            product: {
              type: 'choice',
              instructions: 'Which product best fits the request?',
              criteria: {
                mug_ceramic: { name: 'Ceramic mug', insulated: false, portable: false },
                tumbler_steel: {
                  name: 'Steel tumbler',
                  insulated: true,
                  keeps_hot_hours: 3,
                  portable: true,
                },
                flask_vacuum: {
                  name: 'Vacuum flask',
                  insulated: true,
                  keeps_hot_hours: 12,
                  portable: true,
                },
              },
            },
          },
        },
        notice: ['The model weighs each option’s attributes against the request.'],
      },
    ],
  },
  {
    id: 'fan-out',
    title: 'Many questions, one call',
    subtitle: 'Fan-out, question ids and mixing primitives',
    primitive: 'Concept',
    icon: '🪭',
    steps: [
      {
        title: 'Mix primitives in one request',
        body: [
          'One request can mix any number of Nouls, Choices and Scores. The state is read **once**, and every question is evaluated in parallel. This is [[fan-out]].',
          'It is also how you ask **speculative** questions: ask everything that might matter, then let your code decide which answers to use.',
        ],
        request: {
          state:
            "Hi, I've been trying to connect my Stripe account for 3 days and the integration keeps failing. I'm losing sales. Please help ASAP.",
          questions: {
            department: {
              type: 'choice',
              instructions: 'Which team should handle this?',
              criteria: {
                billing: 'Payment or subscription issues',
                technical: 'Bugs or integration problems',
                sales: 'Pricing or account questions',
              },
            },
            frustration: {
              type: 'score',
              instructions: 'How frustrated does the customer appear?',
              criteria: [
                'Calm, just stating facts',
                'Frustrated but civil',
                'Very angry, strong language',
              ],
            },
            is_urgent: {
              type: 'noul',
              instructions: 'Does the message convey urgency or time-sensitivity?',
            },
            mentions_competitor: {
              type: 'noul',
              instructions: 'Does the customer mention moving to a competitor?',
            },
            churn_risk: { type: 'noul', instructions: 'Is the customer at risk of cancelling?' },
          },
        },
        notice: [
          'Five answers from a single call. Check `usage.input_tokens`: the state is counted once, not five times.',
          'Your code can ignore `mentions_competitor` until it matters. Speculative questions are cheap.',
        ],
      },
      {
        title: 'Question ids are just labels',
        body: [
          'The [[question-id]] (the key) is **not** sent to the model. Naming a question `obviously_spam` does not push the answer toward spam. Only the instructions and criteria matter.',
        ],
        request: {
          state:
            'Congratulations! You have been selected to receive a free cruise. Reply with your card number to claim.',
          questions: {
            q1: { type: 'noul', instructions: 'Is this message a scam?' },
            definitely_not_a_scam: { type: 'noul', instructions: 'Is this message a scam?' },
          },
        },
        notice: ['Both answers should match. The model never saw the misleading key name.'],
      },
    ],
  },
  {
    id: 'confidence-routing',
    title: 'Acting on confidence',
    subtitle: 'The answer says what; confidence says whether to act',
    primitive: 'Concept',
    icon: '🚦',
    steps: [
      {
        title: 'A clear request',
        body: [
          'A banking assistant maps each message to an action. Your code acts on its own **only** when confidence clears a threshold, and that threshold is higher for riskier actions.',
        ],
        request: {
          state: 'What is my current checking account balance?',
          questions: {
            action: {
              type: 'choice',
              instructions: 'Which action does the user want?',
              criteria: {
                check_balance: 'Read-only: show an account balance',
                approve_transfer: 'Move money between accounts or to another person',
                dispute_charge: 'Contest a transaction',
                other: 'None of the above',
              },
            },
          },
        },
        notice: [
          'High confidence on a read-only action means you can act without asking.',
          'For example: `if (confidence < 0.5) escalate(); else if (choice === "check_balance") run(); else if (confidence > 0.9) run(); else confirm();`',
        ],
      },
      {
        title: 'A vague request',
        body: ['Now the message is vague, and it could involve moving money.'],
        request: {
          state: 'Can you sort out the thing with my account from last week? Send it over.',
          questions: {
            action: {
              type: 'choice',
              instructions: 'Which action does the user want?',
              criteria: {
                check_balance: 'Read-only: show an account balance',
                approve_transfer: 'Move money between accounts or to another person',
                dispute_charge: 'Contest a transaction',
                other: 'None of the above',
              },
            },
          },
        },
        notice: [
          'Watch the confidence band. If it is below your threshold, the safe move is to ask a clarifying question, even when the top choice is a transfer.',
          'Try the **Confidence explorer** on the Concepts page to see how a distribution maps to a confidence.',
        ],
      },
    ],
  },
];

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
