---
title: Taming the Spreadsheet Panic
excerpt: Learn why stakeholders often resort to creating new spreadsheets during project stress and discover effective strategies to address the root causes. Improve communication, automate updates, and enhance productivity in your project teams. Read more on managing visibility gaps and stakeholder anxiety.
publishDate: 'Aug 09 2024'
featureImage:
  src: '/taming1.webp'
  alt: Taming a spreadsheet
  caption: Someone taming a spreadsheet
seo:
  image:
    src: '/taming1.webp'
---

> Whenever a PM panics, a new spreadsheet is born.

This tongue-in-cheek observation reflects a common reaction among project stakeholders who lack day-to-day visibility into a project. This behavior isn't limited to PMs; it can occur with anyone who feels disconnected from the project's inner workings.

People often feel the need to organize information, leading them to create new spreadsheets to track what matters to them. However, this adds another source of truth, increases the workload, and reduces productivity. If the information is already available in Jira, why create another spreadsheet? Let's explore this situation more deeply.

## Why Do People React This Way?

![Mystery](/taming2.webp)

- They feel they lack visibility.
- They want to contribute and feel useful.
- They fear the project might fail.

This is akin to someone panicking and flailing in the water, which can lead to them drowning faster. Such reactions are common in stressful situations, especially among less experienced individuals or those with low agency (e.g., new employees or those in less influential positions). Besides spreadsheets, this behavior includes needless Jira updates with messages like "any updates?" and other busy work.

Instead of getting frustrated, ask yourself: why is this happening, and how can I help? Most stakeholders panic because they care deeply about the project's success. Help them become more effective by addressing their concerns.

Ask yourself, what are some questions they have that may not be answered?

- Which features should I closely monitor?
- What's the short-term roadmap? Can I promise feature Y will be released on Monday or Thursday? How can I update my client beyond saying, "they're working on it"?

## Address the Root Causes

![AddressCause](/taming3.webp)

Sometimes, simply keeping stakeholders updated in a language they understand can help. Determine the frequency of updates they need and see if you can automate or semi-automate this process. During high-stress times (e.g., looming deadlines or incidents), I post regular asynchronous updates on Slack with key points and informative emojis. Tailor these updates to what matters most to your stakeholders (e.g., who's working on what, when something will be ready, or status updates for customers) so they can quickly get the information they need.

### Examples:

**Delivery Updates**

- 🟢 **Feature X**: Bob is finishing reviews. Deployment **expected today**.
- 🌕 **Feature Y**: Alice encountered issues. Release may be **delayed to Friday**.
- 🔴 **Feature Z**: Charlie needs clarification: red or magenta? (Will choose magenta if no response by Thursday, cc @designer)

**Incident Management**

- 🌨️ Incident Ongoing:
  - Issue identified, working on restoration.
  - Systems expected back in **~1 hour**.
  - 🟢 No customer data lost or leaked.
  - Details in #incident-20240808

One counter-indication with those messages is: avoid creating too much noise. If you are in the habit of frequently posting non-actionable, non-critical messages, people may start to ignore them and you won't get your information across. Less is more.

### Alternatively, Keep the Spreadsheet!

At Unito, I learned that people love the comfort of their favorite tools. Not everyone wants to use Jira or GitHub issues, and some can't due to limited licenses. Sometimes, other tools offer different perspectives (e.g., using spreadsheets to compute and categorize story points). In such cases, automate as much as possible. Many tools and plugins allow automatic extraction from ticketing systems, and low-code tools can help build automated dashboards for your stakeholders.

## Sound Off!

What about you? Have you seen this happen in your organization? Or are you on the other side of the coin, struggling to get clear metrics from engineering? Let me know! I'm looking to interview a few people and explore building tools to address this common visibility problem.
