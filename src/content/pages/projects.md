---
title: Projects
featureImage:
  src: '/post-8.webp'
  alt: Abstract art picture, maybe capturing the complexity of projects?
seo:
  title: Projects
  description: Here's a quick list of some fun projects I am working on. I might add some blogging about them at a later time.
  image:
    src: '/post-8.jpg'
---

# My Projects

Welcome to my project showcase! Below are some exciting initiatives I'm exploring in my spare time. I'll be sharing detailed blog posts about my progress, and I'm open to expanding on these topics. If any project piques your interest, feel free to reach out for updates or discussions.

## Custom GPTs

Exploring the limits of GPT models, I'm developing custom prototypes for various applications. Here's what I'm experimenting with:

- **Pole Fitness Pro**: This AI assists with identifying pole fitness moves and offers progression training.
- **Condo Concierge**: Designed to sift through tedious condo board meeting notes and bylaws for easy reference.
- **Sassy Chef**: Inspired by Gordon Ramsay, this AI assists with food safety, sous vide cooking, wine pairings, and recipe inspiration.
- **Fitness Scientist**: A brainstorming partner for optimizing training regimens.
- **Engineering Mentor**: Leveraging my engineering knowledge to create an AI mentor for engineering managers.

Want to know more? Check out the [blog post](/blog/custom-gpts-exploration/).

**Tech Stack**: GPT-based models

## The Plan App

Working on a white label workout app for mobile. I've been using a few apps in the past for crossfit and powerlifting with mitigated results. So far, I have yet to come across a clean app where you can easily import exercises, programs, have access to a rest timer, be able to program supersets, track weights, reps, RPE and other information that is important for a good training program. I have been following different programs and most of the good ones come as simple spreadsheets, but they are a pain to consult while working out. I'm currently working on scratching my itch by porting over some of my favorite spreadsheet-style programs to an app for myself, but building the foundations for a white label solution for trainers in the future.

**Tech Stack**: Rapid prototyping using Flutter and Supabase

## The Summarizer

To streamline my reading workflow, I'm working on an AI that aggregates and summarizes tech and software engineering newsletters. This tool will highlight the most relevant articles, saving time and effort. Depending on its success, I may release the app or curate a specialized mailing list.

**Tech Stack**: Undecided. Probably simply some crons, some scraping and OpenAI API.

## Coaching App

In my career and relationships, I've always done mentoring and following up on various people. Whether it is technical coaching, managenarial mentorship or following up an actual training program, I've always been interested in helping people grow. I've seen a couple of other tools out there helping with coaching like 15five (an excellent 1:1 and follow up tool). Everything is still a bit off compared to how I structure my notes. I'd love to have a singular view of a person before I jump in a coaching session: what were our latest 1:1s about? What is their growth plan? Are there any follow ups? Additionally, there's recurring patterns in what people can be coach for. I'd love to use a bit of AI to give me some ideas of what might be next to help them get over their work/life plateau, perhaps even leveraging a custom GPT I have trained.

**Tech Stack**: Probably a simple nextjs or nestjs app. Typescript. OpenAI API.

## MeatPi

I love cooking and making my own charcuterie. Unfortunately, this can be difficult in a small city condo. I've rigged up a wine fridge with power relays to try to re-create optimal conditions for a curing chamber. This is an existing project that I need to rebuild after an unfortunate beer explosion accident. I basically have a RaspberryPi hooked up to:

- A camera,
- Two on/off relays
  - One for the fridge to control the temperature.
  - One for the humidifier.

I would love to add some extra features such as weight sensors so I can graph the done-ness of my charcuterie, or using LEDs and a camera to get progress pictures. Once I have everything working well, I can see about cost-optimizing my setup and make easy build plans to distribute to friends.

**Tech Stack**: TBD, previously javascript but could test Golang and the Viam robotics framework.

## Burning Man Lighting Rig

![Burningman](/burning_man.jpeg)

Went to Burning Man this year, so I built some Arduino-powered wearable lights. They were music-reactive lights, might addressable lights reacting to ambient noise through a microphone. Create a self adjusting/healing algorithm so that it would create neat patterns even when surrounded with loud noise, and go back to more sensitive levels after a period of time. Althought the prototype managed to survive the playa dust, I would love to:

- Properly redo the soldering so that it is more robust.
- Create a protective housing, make it easy to extend/shorten with wires depending on where you want your batteries, lights and microphone.
- Clean up the code, open source it.
- Test power consumption, try scaling with other addressable LEDs.

Once I fix it up a bit, I can play with different patterns and offer to build prototypes for friends.

**Tech Stack**: Arduino, C, electronics.

## The Shirt Store Experiment

It's been a while since I've worked on setting up an e-commerce site. With today's advances, I wonder how fast it would be for me to create a self running nerdy fitness apparel store using AI to generate designs and to guide the creation of content.

- What are operating costs? Can it be close to zero when no demand?
- How fast can I go from stupid idea at the bar to orderable apparel in the store?
- How well can I craft my prompts to get solid designs?

**Tech Stack**: prompt engineering, astro, shopify?

## ParkingFox

Early in my consulting career, I would travel to multiple clients in the city by car, and every time I would need to find parking nearby that didn't make too much of a dent in my budget. Over time, I started learning at which locations parking restrictions were about to expire, giving me a good chance to snag a free parking spot. At the time, all the different buroughs of the city had their own way to document street signs but it may have been standardized by now. Building a mobile app showing you locations where you might get lucky with free parking using that heuristic might be a fun and useful project.

**Tech Stack**: native mobile, or flutter. TBD for backend that can store map markers and do geo operations.

## More

I have more threads of ideas revolving around tracking time, automating time sheets, submitting SRED reports as well as automatically parsing engineering metrics to automate part of my work as an engineering manager, but nothing I'm ready to share here yet 🤫.
