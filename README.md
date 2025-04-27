# Ghost Guide
![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Google Gemini](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

![Alt text](https://cdn.discordapp.com/attachments/1362474652022345828/1366051899463172206/Screenshot_from_2025-04-27_06-59-54.png?ex=680f8a78&is=680e38f8&hm=b193fc86f343baaf10b64612a0c0651ddbf7d8d2f0547dcc82805953e7a1c9c3&)

## The Problem We're Solving

Have you ever tried to learn Blender, Figma, or CAD software for the first time? If you have, you know the frustration.
You open up the program and think: "Where do I even begin?"

So you do what everyone does - you find tutorials. And while tutorials are great for getting a crash course, they come with significant drawbacks:

- They're often painfully slow (15 minutes to explain a 30-second task)
- They're frequently over-generalized for broader audiences
- Many are outdated, showing interfaces that no longer exist
- You constantly pause, rewind, and switch between windows

This creates a massive learning curve that turns away countless potential users from powerful creative tools.

## Our Solution: Ghost Guide

We built **Ghost Guide** - the first general-purpose tutorial agent that lives directly on your desktop as an invisible layer, guiding you through software in real-time.

Ghost Guide transforms how we learn software by bringing tutorials directly into your workspace.

## What Inspired Us

Our journey began when our teammate was recording videos during his internship. Despite his clear instructions and careful recording, people still struggled to follow along. The disconnect between watching a tutorial and implementing the steps is just too great.

We realized there had to be a better way - what if instead of switching between tutorial videos and your software, the tutorial could exist as an overlay *on top of* your actual workspace?

## How Ghost Guide Works

1. **Simple Entry Point**: Begin by entering the URL of a tutorial video you would have watched
2. **AI Analysis**: Our system uses Gemini 2.5-pro to analyze the video's content and extract structured steps
3. **Checkpoint Creation**: The AI creates precise checkpoints for each tutorial step
4. **Desktop Integration**: Using Electron, we create an invisible layer over your desktop
5. **Intelligent Positioning**: At each checkpoint, we take a screenshot that the AI analyzes to identify coordinate positions
6. **Guided Interface**: We overlay intuitive UI elements that point directly to where actions need to be taken

## How We Built It

Building Ghost Guide required solving several technical challenges:

1. We created a desktop client using Electron to build the transparent overlay system
2. We implemented screenshot analysis that identifies UI elements and their positions
3. We developed an AI processing pipeline that converts video tutorials into structured checkpoints
4. We designed a minimalist but effective UI overlay system that guides without distracting

## Challenges We Faced

This project pushed us to overcome significant hurdles:

- **Cross-Platform Compatibility**: Making our solution work across different operating systems required careful architecture decisions
- **Screen Analysis Precision**: Ensuring our AI could accurately identify interface elements across different software was technically challenging
- **Tutorial Extraction**: Converting video tutorials into actionable steps required sophisticated AI prompting and processing
- **Performance Optimization**: Maintaining smooth performance while running complex AI analysis in the background demanded extensive optimization

## What We Learned

Through building Ghost Guide, we've gained invaluable insights:

- The power of AI in desktop modality integrations.
- User experience must remain central - even the most advanced technology fails if it's not intuitive
- Solving the "tutorial gap" has applications far beyond creative software
