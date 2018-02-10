# Alexa Dev Guideline

- [AWS LAMBDA](https://aws.amazon.com/lambda/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Amazon Developer Portal](https://developer.amazon.com/alexa)
- [XML RSS 2.0 Specs](https://validator.w3.org/feed/docs/rss2.html)
- [Alexa Skill Metadata](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/define-skill-metadata)
- [Alexa Built-in Intents](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/implementing-the-built-in-intents)
- [Alexa Voice Service](https://developer.amazon.com/avs)
- [Alexa SDK Node Modules](https://www.npmjs.com/package/alexa-sdk)
- [Tips for Skill Certification](https://developer.amazon.com/alexa-skills-kit/launch/#certification)

---

## Project Description

This is the complete project of building flash briefing skill and a custom interactive skill for Alexa. The custom interactive skill is also linked to the Alexa mobile app which showing image cards.

---

## Table of contents

- [Quick start](#quick-start)
- [Folder Structure](#folder-structure)
- [Flash Briefing](#flash-briefing)
- [Skill Architecture](#skill-architecture)
- [Custom Slot](#custom-slot)
- [File Format](#file-format)
- [Developer Note](#developer-note)
- [Creators](#creators)
- [Copyright and license](#copyright-and-license)

---

## Quick Start

[Amazon Developer Portal](https://developer.amazon.com/alexa) is the home of you Alexa skill. This is where you create the skill, manage skill information and information of your Lambda Function. In Alexa development, this service is called Skill Interface.

[AWS Lambda](https://aws.amazon.com/lambda/) is a service to implement your code or function without running on a server. In Alexa developement, this service is called Skill Service

[AWS S3](https://aws.amazon.com/s3/) Amazon requires all contents that used in Alexa skill is accessed by HTTPS so S3 is the best solution for the Alexa skill's content cloud storage

[Alexa Voice Service](https://developer.amazon.com/avs) (AVS) is Amazon’s intelligent voice recognition and natural language understanding service that allows you as a developer to voice-enable any connected device that has a microphone and speaker.

Adding package.json "npm init"

Adding alexa sdk into your package.json using "npm install --save alexa-sdk"

```
{
  "name": "hacklbm",
  "version": "1.0.0",
  "description": "hi there. this is an interactive skills for amazon alexa echo built on node.js 6.10, serviced by AWS Lambda and Amazon Developer Portal. huyle.finance@gmail.com",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "yourrepo"
  },
  "keywords": [
    "alexa"
  ],
  "author": "huy le huyle.finance@gmail.com",
  "license": "ISC",
  "dependencies": {
    "alexa-sdk": "^1.0.11"
  }
}
```
Running "npm install" to add node_modules

---

## Folder Structure

```
Alexa-Project/
├── skill/
│   ├── intentSchema/
│   │   └── intentSchema.JSON
│   ├── speechAssets/
│   │   ├── budgeting_Tips.txt
│   │   ├── investing_Tips.txt
│   │   └── utterances.txt
│   ├── src/
│   │   └──index.js
└── flash-briefing/
    ├── speechAssets/
    │   └── audio.mp3
    └── src/
        ├── content.json
        └── my-audio-content.xml
```
---

## Flash Briefing

A Flash Briefing provides a quick overview of news and other content such as comedy, interviews, and lists that a customer discovers and enables in the Skills section of the Alexa app

![https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/understanding-the-flash-briefing-skill-api](https://developer.amazon.com/public/binaries/content/gallery/developerportalpublic/solutions/alexa/alexa-skills-kit/content-skill_diagram_540x420_asv2.png)

Alexa Flash Briefing Feeds can be built by XML RSS or JSON. The content of the feeds need to be stored on HTTPS. In this project, I store them on AWS S3.

For this skill, I use XML RSS to implement the news. The XML file need to follow the feed reference of Amazon and W3 XML RSS 2.0.

[Amazon Flash Briefing Feed Reference](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/flash-briefing-skill-api-feed-reference)

[XML RSS 2.0 Specs](https://validator.w3.org/feed/docs/rss2.html)

### Sample XML RSS Feed item for Alexa:

```
<item>
    <link>https://www.quora.com/</link>
    <guid isPermaLink="false">this_is_a_unique_string_when_isPermaLink_false_just_to_make_for_keep_track_of_the_content</guid>
    <title>Developer news</title>
    <description>&lt;p&gt;Latest news for developers on Quora&amp;nbsp;&lt;/p&gt;</description>
    <pubDate>Mon, 17 Jul 2017 21:40:22 +0000</pubDate>
    <category>general:products/aws-lambda,marketing:marchitecture/compute,general:products/amazon-cloudfront</category>
    <author>huyle.finance@gmail.com</author>
</item>

```

---

## Skill Architecture

![https://developer.amazon.com/alexa-skills-kit#learn](https://images-na.ssl-images-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/homepage/ASK-page_build._CB529900201_.png)

Alexa Skill Flow:

- New Session
- Launch Request (Invoke the skill without intent or data such as Alexa [Invocation Name], ex: Alexa, ask MyMoney)
- Intent Request (Calling the [Invocation Name] with the intent of doing something, ex: Alexa, ask MyMoney for budgeting tips)
- Session Ended Request (Exiting skill)

---

## Custom Slot

[Amazon Slot Reference](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/slot-type-reference)

## File Format

/speechAssets
.txt
.mp3

/src
Node.js 6.10

/intentSchema
JSON

/imageAssets
.png
.jpg

---

## Developer Note

All content files are hosted on AWS S3 huyle.finance@gmail.com in f4m bucket

flash briefing skill is on huyle.finance@gmail.com Amazon Developer account, named: beta prototype

src node.js is hosted on AWS Lambda, huy's account.

flash-briefing note: prefer XML format over JSON

---

## Creators

Huy Le

huyle.finance@gmail.com

---

## Copyright and license

Huy Le 2018