---
title: Exploring Custom GPTs
excerpt: Join us on an intriguing exploration into the diverse applications of custom GPTs. From a virtual pole fitness coach to a condo concierge, and even a sassy chef assistant, we're testing the limits and learning the quirks of AI in real-life scenarios. Discover the successes, the hiccups, and the surprising lessons learned along the way.
publishDate: 'Nov 24 2023'
featureImage:
  src: '/custom_gpt.webp'
  alt: Exploring Custom GPTs
  caption: Exploring Custom GPTs
seo:
  image:
    src: '/custom_gpt.webp'
---

# Exploring the Potential of Custom GPTs: A Journey into AI Customization

The advent of custom GPTs, as announced at OpenAI's latest developer event, has sparked a wave of enthusiasm among tech geeks. Intrigued by this that trend, I decided to take this new feature for a spin. This exploration aimed to answer several questions: Could custom GPTs transcend the limitations of pre-set chat prompts? Is it feasible to equip them with specialized knowledge sources? And importantly, how do these customizations enhance user experience and the accuracy of the AI's responses?

## Experiment 1: Pole Instructor AI

The first experiment involved creating a Pole Instructor AI, designed to test advanced capabilities such as:

- Recognition of specific pole fitness moves (e.g., jade split, teddy bear, iron x).
- Identifying moves from reference images.
- Generating images based on move names or descriptions.
- Providing specialized coaching advice, including warm-up techniques, progression steps, and guidance on executing specific positions.

This ambitious feature set and niche domain would certainly tax the limitations of custom GPTs.

### Initial Impressions

On the surface, things looked great!

- The AI's tone was encouraging and supportive, mirroring a coach's demeanor.
- Setup was straightforward and user-friendly.
- The AI showed an impressive understanding of pole fitness terminology.

### Challenges Encountered

But we encountered a few concerning issues:

- Image recognition was inaccurate.
- Despite corrections, the advice on progression and techniques was sometimes misleading.

### Issues with Image Generation

Initially, the AI refused to generate images, likely due to content filtering challenges associated with the sport's inherent physicality. To address this, I reconfigured the GPT to create safe-for-work (SFW) illustrations. However, the results were less than satisfactory:

![Example of Unrealistic AI-Generated Image 1](/unrealistic_expectations1.png)
![Example of Unrealistic AI-Generated Image 2](/unrealistic_expectations2.png)

### Conclusions

While the AI excelled in tone and vocabulary, its advice was generic and potentially risky due to overconfidence. While there's potential for improvement in recognition and image generation, the investment may not be justified at this stage.

## Experiment 2: Condo Concierge AI

The second experiment focused on an AI capable of interpreting and translating condominium bylaws and board meeting notes. I've always found those documents to be tedious to read through, just to get small nuggets of pertinent information. Perhaps AI would save the day here.

### Building the Knowledge Base

I fed the AI a series of French-language PDFs from our condo complex. Remarkably, it had no issues parsing and translating these documents. I also calibrated its tone to be concise and factual, avoiding the pitfalls encountered with the Pole Instructor AI.

### Results

- The AI proved immediately valuable, adeptly translating documents and answering queries. This functionality could greatly enhance accessibility in multilingual areas like Quebec.
- The responses were succinct and factual, avoiding the issue of false expertise seen in the previous experiment.

![Condo Concierge AI Screenshot](/condo_concierge.png)

### Future Considerations

This raises questions about the optimal model for such a custom GPT. Should it be individualized per building or board, or generalized for broader use? Integration with existing condo management systems, augmented by an API for easy document upload, might provide a comprehensive and commercially viable solution.

## Experiment 3: Sassy Chef AI

Inspired by the assertive style of renowned chefs like Gordon Ramsay, the third experiment entailed building a culinary AI coach with capabilities including:

- Suggesting recipes based on available ingredients, cuisine type, or occasion.
- Recommending wine pairings.
- Providing accurate cooking times and temperatures, particularly for food safety and sous-vide techniques.

### Observations

- The AI was immediately helpful, offering creative recipe ideas and wine pairings, along with reliable cooking instructions.
- Its ability to parse PDFs for more intricate data, like wine pairings or seasonal produce, needs refinement.

![Sassy Chef AI Example 1](/sassy1.png)
![Sassy Chef AI Example 2](/sassy2.png)
![Sassy Chef AI Example 3](/sassy3.png)

### Reflections

While the AI served as a source of culinary inspiration, it begs the question: Does customizing a GPT add significant value beyond a unique 'flavor'? The importance of context in AI interactions remains a key consideration.

## Final Thoughts

Creating custom GPTs is both accessible and engaging. The process is user-friendly, allowing for ongoing refinements. However, caution is advised when employing AI in specialist domains, due to potential inaccuracies. Custom GPTs excel in parsing and summarizing large documents, aiding accessibility and simplifying complex information. They are best viewed as digital interns or assistants, gradually trained to assist in research and ideation.
