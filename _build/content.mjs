// The words in the profile pictures. They follow totalvdo.com (the website repo's index.astro, about.astro and
// src/content/services), so the GitHub profile and the website say the same thing. Change them there first.

// The home page headline, one entry per line on the wide picture.
export const HEADLINE = ["Digital, AI and ML", "implementation", "and integration"];

// The website's service menu in its order (AI first), drawn as TV channels. Each programme is
// [service name, one short line]. Each inner list is one row of the guide on the wide picture.
export const CHANNELS = [
  {
    name: "AI and ML",
    rows: [
      [
        ["LLM integration", "OpenAI, Claude, Gemini or open models"],
        ["RAG on company documents", "Answers that cite your own files"],
        ["AI agents and assistants", "Qualify leads, update your CRM"],
      ],
      [
        ["Computer vision", "Detection on live camera streams"],
        ["Recommendation engines", "Personalized rows for streaming apps"],
      ],
      [
        ["Forecasting models", "Time-series and weather-style"],
        ["MLOps and GPU inference", "Serving, drift alerts, rollbacks"],
      ],
    ],
  },
  {
    name: "Integration and automation",
    rows: [
      [
        ["CRM automation", "HubSpot, Zoho and Salesforce"],
        ["GoHighLevel", "Agency setup, SaaS mode, workflows"],
        ["APIs and cloud", "AWS, Google Cloud, Azure, CI/CD"],
      ],
    ],
  },
  {
    name: "Software",
    rows: [
      [
        ["Web applications", "Laravel, Node.js, Next.js, Angular"],
        ["Mobile apps", "iOS and Android, Flutter, Kotlin"],
        ["Dedicated developers", "Our Noida team, overlapping US mornings"],
      ],
    ],
  },
  {
    name: "Streaming and TV",
    rows: [
      [
        ["OTT platforms", "Video CMS, backend, DRM, analytics"],
        ["Smart TV apps", "Tizen, webOS, Fire TV, Apple TV, Vizio"],
        ["Roku channels", "SceneGraph, ads, subscriptions"],
      ],
      [
        ["Live streaming", "WebRTC and LL-HLS, recorded to VOD"],
        ["Digital signage", "Players, cloud CMS, scheduling, ads"],
      ],
    ],
  },
];

// Contact buttons under the intro. The details are the ones published on totalvdo.com (src/data/site.ts).
export const BUTTONS = [
  { file: "button-email", label: "Email info@totalvdo.com", primary: true },
  { file: "button-whatsapp", label: "WhatsApp +91 97110 98932" },
  { file: "button-linkedin", label: "LinkedIn" },
];
