import type { Lesson } from './types';

export const lessons: Lesson[] = [
  {
    id: 'hotdog',
    title: 'Binary decisions',
    subtitle: 'Settle the everlasting debate with a Noul',
    primitive: 'Noul',
    icon: '🌭',
    steps: [
      {
        title: 'Basic question',
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
        title: 'Decision criteria',
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
        title: 'Structured state fields',
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
        title: 'Consistency checks',
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
    title: 'Category selection',
    subtitle: 'Go beyond blue with a Choice',
    primitive: 'Choice',
    icon: '🌤️',
    steps: [
      {
        title: 'Option selection',
        body: [
          'A [[choice]] question picks one option from a set you define. The options are the keys of `criteria`. Use `null` when an option needs no description.',
        ],
        request: {
          state: 'It is noon on a clear, cloudless summer day over Lake Tekapo.',
          questions: {
            sky_color: {
              type: 'choice',
              instructions: 'Category selection',
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
        title: 'Uncertain outcomes',
        body: [
          'Now the state is genuinely ambiguous. A good decision model should **say so** rather than guess with false certainty.',
        ],
        request: {
          state:
            'The sun is setting over the Tasman Sea while a dark southerly front rolls up the coast.',
          questions: {
            sky_color: {
              type: 'choice',
              instructions: 'Category selection',
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
        title: 'Option criteria',
        body: [
          'Option names alone leave room for interpretation. Give each option a [[rubric]] description, and add an escape-hatch option for cases that fit none of them.',
        ],
        request: {
          state:
            'The sun is setting over the Tasman Sea while a dark southerly front rolls up the coast.',
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
    title: 'Scoring',
    subtitle: 'A real-life court case, rated with a Score',
    primitive: 'Score',
    icon: '📷',
    steps: [
      {
        title: 'Scoring scale',
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
        title: 'Level definitions',
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
        title: 'Composite scoring',
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
    subtitle: 'Give the model a strip, a clearance and a readback',
    primitive: 'Concept',
    icon: '🗂️',
    steps: [
      {
        title: 'Text state',
        body: [
          'The simplest [[state]] is a string, which works well for a single transmission, a METAR or a NOTAM.',
        ],
        request: {
          state:
            'Wellington Approach, ANZ1043, request descent, we are getting moderate turbulence at flight level two one zero.',
          questions: {
            requests_descent: {
              type: 'noul',
              instructions: 'Is the pilot requesting a lower level?',
            },
            reports_turbulence: {
              type: 'noul',
              instructions: 'Does the pilot report turbulence?',
            },
          },
        },
        notice: [
          'Fine for one transmission. But checking a readback means comparing it against the clearance that was issued. One string can’t hold both clearly.',
        ],
      },
      {
        title: 'Object state',
        body: [
          'Put related information together in one JSON object, with descriptive keys. Think of it as the strip, the clearance and the tape you would hand to a supervisor before asking them to decide.',
        ],
        request: {
          state: {
            flight: {
              callsign: 'ANZ1043',
              type: 'A320',
              route: 'NZAA → NZWN',
              cleared_level: 'FL210',
            },
            clearance:
              'ANZ1043, descend to 7000 feet, QNH 1009, turn right heading 340, contact Wellington Approach 119.3',
            readback: 'Descend 7000 feet, QNH 1019, right heading 340, 119.3, ANZ1043',
            note: 'Fictional frequencies and callsign usage, for training only.',
          },
          questions: {
            level_correct: {
              type: 'noul',
              instructions: 'Does the level in `readback` match the level in `clearance`?',
            },
            qnh_correct: {
              type: 'noul',
              instructions: 'Does the QNH in `readback` match the QNH in `clearance`?',
            },
            heading_correct: {
              type: 'noul',
              instructions: 'Does the heading in `readback` match the heading in `clearance`?',
            },
          },
        },
        notice: [
          'Questions point at named fields like `readback` and `clearance` using backticks.',
          'Each element is checked separately, so your code can say exactly which one was wrong: here, the QNH (1019 read back for 1009).',
        ],
        tryThis: ['Correct the readback to QNH 1009 and rerun.'],
      },
      {
        title: 'Array state',
        body: [
          'An array suits ordered things, such as an exchange of transmissions or a run of system log lines.',
        ],
        request: {
          state: [
            'Christchurch Control, ZK-MKT, request climb to flight level two one zero.',
            'ZK-MKT, climb flight level two one zero.',
            'Climb flight level two three zero, ZK-MKT.',
            'ZK-MKT, negative, climb flight level two one zero, I say again two one zero.',
            'Climb flight level two one zero, ZK-MKT, sorry about that.',
          ],
          questions: {
            mismatch_occurred: {
              type: 'noul',
              instructions: 'Did the pilot read back an incorrect level at any point?',
            },
            mismatch_resolved: {
              type: 'noul',
              instructions:
                'By the end of the exchange, has the pilot correctly read back the cleared level?',
            },
          },
        },
        notice: [
          'The model reads the whole sequence: a mismatch happened, and was then corrected.',
          'Asking both questions separately is what lets code log the event without raising an alarm.',
        ],
      },
    ],
  },
  {
    id: 'structured-instructions',
    title: 'Structured instructions',
    subtitle: 'Pass reference data along with the question',
    primitive: 'Concept',
    icon: '🧩',
    steps: [
      {
        title: 'Object instructions',
        body: [
          'Sometimes the question needs its own reference data. [[instructions]] can be an object: put the question in one field and the data in the others, then refer to the data by name in backticks.',
          'This keeps the state about the **thing being judged** (here, a newly filed flight plan), while the question carries what to compare it with.',
          '**Note:** some compatible servers accept only plain-string instructions. If you get HTTP 422 on this lesson, that is why.',
        ],
        request: {
          state: {
            filed_plan:
              'FPL-ANZ8231-IS -AT76/M-SDFGRY/S -NZWN0615 -N0270F170 DCT -NZNS0045 -PBN/A1B2C2D2 DOF/261001 REG/ZKMCA',
          },
          questions: {
            duplicate_plan: {
              type: 'noul',
              instructions: {
                existing_plan: {
                  callsign: 'ANZ8231',
                  departure: 'NZWN',
                  destination: 'NZNS',
                  eobt: '0615',
                  date: '2026-10-01',
                },
                question: 'Is `filed_plan` a duplicate of `existing_plan`?',
              },
            },
          },
        },
        notice: [
          'The question names `existing_plan`, and the model finds it in the instructions object.',
          'Duplicate flight plans are a classic flight data processing headache. A probability lets code reject obvious duplicates and queue borderline ones for a human.',
        ],
        tryThis: ['Change the existing plan’s `eobt` to 0915 and rerun.'],
      },
      {
        title: 'Structured criteria',
        body: [
          'Option descriptions can also be objects. This is useful when each option carries attributes, such as runways with their headings and approach aids.',
        ],
        request: {
          state: {
            metar: 'METAR NZWN 012200Z 35038G52KT 9999 FEW025 SCT040 14/07 Q1006',
            note: 'Fictional observation, for training only.',
          },
          questions: {
            runway_in_use: {
              type: 'choice',
              instructions: 'Which runway direction best suits the wind in `metar`?',
              criteria: {
                '16': { runway: '16', approx_heading_deg_true: 160, note: 'Southerly operations' },
                '34': { runway: '34', approx_heading_deg_true: 340, note: 'Northerly operations' },
              },
            },
          },
        },
        notice: [
          'The model weighs each option’s attributes against the wind: 350° at 38 kt gusting 52 favours landing into it on runway 34.',
          'You still decide the runway in code and procedure. The model’s answer is a cross-check, not an instruction.',
        ],
      },
    ],
  },
  {
    id: 'fan-out',
    title: 'Multiple questions',
    subtitle: 'Fan-out, question ids and mixing primitives',
    primitive: 'Concept',
    icon: '🪭',
    steps: [
      {
        title: 'Combined decision types',
        body: [
          'One request can mix any number of Nouls, Choices and Scores. The state is read **once**, and every question is evaluated in parallel. This is [[fan-out]].',
          'It is also how you ask **speculative** questions: ask everything that might matter, then let your code decide which answers to use.',
        ],
        request: {
          state:
            'Christchurch Control, ANZ529, we have a passenger with a suspected heart attack, request diversion to Wellington and priority, we are at flight level three five zero.',
          questions: {
            message_type: {
              type: 'choice',
              instructions: 'What kind of transmission is this?',
              criteria: {
                routine_request: 'A normal request such as a level or route change',
                urgency: 'A PAN-type situation: urgent but no immediate danger to the aircraft',
                distress: 'A MAYDAY-type situation: grave and imminent danger to the aircraft',
                information: 'A report with no request',
              },
            },
            workload_impact: {
              type: 'score',
              instructions:
                'How much controller workload will this create in the next ten minutes?',
              criteria: [
                'Negligible',
                'Some coordination',
                'Significant coordination',
                'Dominates the sector',
              ],
            },
            requests_diversion: {
              type: 'noul',
              instructions: 'Is the crew requesting a diversion?',
            },
            requests_priority: {
              type: 'noul',
              instructions: 'Is the crew requesting priority handling?',
            },
            medical_services: {
              type: 'noul',
              instructions: 'Will medical services likely be needed on arrival?',
            },
          },
        },
        notice: [
          'Five answers from a single call. Check `usage.input_tokens`: the state is counted once, not five times.',
          'Your code can ignore `medical_services` until it matters. Speculative questions are cheap.',
          'Note how a medical emergency is usually an urgency (PAN) situation, not distress. Watch whether the model agrees and how confident it is.',
        ],
      },
      {
        title: 'Question identifiers',
        body: [
          'The [[question-id]] (the key) is **not** sent to the model. Naming a question `definitely_routine` does not push the answer toward routine. Only the instructions and criteria matter.',
        ],
        request: {
          state:
            'MAYDAY MAYDAY MAYDAY, ZK-PLR, engine failure, forced landing, 5 miles south of Taupō, two on board.',
          questions: {
            q1: { type: 'noul', instructions: 'Is this a distress call?' },
            definitely_routine: { type: 'noul', instructions: 'Is this a distress call?' },
          },
        },
        notice: ['Both answers should match. The model never saw the misleading key name.'],
      },
    ],
  },
  {
    id: 'confidence-routing',
    title: 'Confidence thresholds',
    subtitle: 'The answer says what; confidence says whether to act',
    primitive: 'Concept',
    icon: '🚦',
    steps: [
      {
        title: 'Specific requests',
        body: [
          'An engineering ops assistant maps each message to an action. Your code acts on its own **only** when confidence clears a threshold, and that threshold is higher for riskier actions. Restarting a live ATC service is about as risky as it gets.',
        ],
        request: {
          state:
            'What is the current status of the ADS-B ground station feed into the surveillance data processor?',
          questions: {
            action: {
              type: 'choice',
              instructions: 'Which action does the engineer want?',
              criteria: {
                show_status: 'Read-only: show the health or status of a system',
                restart_service: 'Restart or fail over a live operational service',
                raise_change_request: 'Start a change request for planned work',
                other: 'None of the above',
              },
            },
          },
        },
        notice: [
          'High confidence on a read-only action means you can act without asking.',
          'For example: `if (confidence < 0.5) askForClarification(); else if (choice === "show_status") run(); else if (choice === "restart_service") requireSupervisorApproval(); else confirm();`',
          'Note that `restart_service` should never run automatically, however confident the model is. Confidence gates *how* you proceed, not *whether* safety procedures apply.',
        ],
      },
      {
        title: 'Ambiguous requests',
        body: ['Now the message is vague, and it could involve restarting something live.'],
        request: {
          state: 'Can you sort out that thing with the radar feed from last night? Just bounce it.',
          questions: {
            action: {
              type: 'choice',
              instructions: 'Which action does the engineer want?',
              criteria: {
                show_status: 'Read-only: show the health or status of a system',
                restart_service: 'Restart or fail over a live operational service',
                raise_change_request: 'Start a change request for planned work',
                other: 'None of the above',
              },
            },
            target_identified: {
              type: 'noul',
              instructions:
                'Does the message identify one specific system or service unambiguously?',
            },
          },
        },
        notice: [
          'Watch the confidence band and `target_identified`. Even when the top choice is a restart, a vague target means the safe move is to ask which system is meant.',
          'Try the **Confidence explorer** on the Concepts page to see how a distribution maps to a confidence.',
        ],
      },
    ],
  },
];

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
