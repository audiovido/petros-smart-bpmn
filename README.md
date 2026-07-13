# Petros — Smart BPMN 2.0 AI Platform

A fully client-side BPMN design workspace built for GitHub Pages. It combines an interactive `bpmn-js` canvas with senior-grade AI generation, assisted editing, auditing, SOP generation, bilingual English/Persian UI, and BPMN/SVG export.

Petros supports OpenAI, Anthropic, OpenRouter, Groq, DeepSeek, Google Gemini, Mistral AI, and custom OpenAI-compatible HTTPS endpoints. Each provider has its own locally stored key and model. A persistent business-context profile is included in every AI request so generation, audits, and SOPs stay specific to the organization.

## Run locally

ES modules require an HTTP server:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Deploy to GitHub Pages

Push this directory to a GitHub repository, then choose **Settings → Pages → Deploy from a branch** and select the repository root. No build command is required.

## Security model

API keys are stored separately in the browser's `localStorage` and sent directly only to the selected provider. This is convenient for a personal, serverless tool, but `localStorage` is not encrypted and any script running on the same origin can read it. Use restricted keys with spending limits and avoid this architecture on shared or untrusted devices.

## Structure

- `index.html` — accessible application shell and CDN dependencies
- `css/styles.css` — responsive glassmorphism/cyberpunk visual system
- `js/app.js` — application state and interactions
- `js/providers.js` — provider registry, endpoints, defaults, and key validation
- `js/ai-service.js` — provider adapters and strict senior business-process prompts
- `js/bpmn-service.js` — `bpmn-js` import, edit, and export integration
- `js/i18n.js` — English and Persian translations
- `js/utils.js` — response extraction, safe rendering, and export helpers
