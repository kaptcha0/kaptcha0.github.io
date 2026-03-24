---
title: "New Research: Biologically Approximated Neural Network"
subtitle: A proposition to new AI research
description: ""
published: true
date: 2026-03-24
tags:
  - research
  - ai
---
## tl;dr
Over a 1.5 year time-frame, I researched and tried to mathematically model a biological neural network, resulting in an artificial neural network infrastructure that was relatively accurate, and used less resources compared to a conventional artificial neural network while accomplishing the same tasks. I dubbed this the *Biologically Approximated Neural Network (BANN)*. This article lists the thought process behind it, and officially releases my research paper to the public, for scrutiny, inspiration, and comments.
## background
I've been interested in AI, ever since the early days. In the 6th and 7th grades, using nothing but random YouTube videos and [Scratch](https://scratch.mit.edu), I made several attempts to create AI models. I tried making:

1. Self-navigation models
	- https://scratch.mit.edu/projects/288497612/
	- https://scratch.mit.edu/projects/339418008/
	- https://scratch.mit.edu/projects/296529711/
2. Neural network powered readable text generator
	- https://scratch.mit.edu/projects/306924579/

Eventually, I learned about LLMs, which were still rudimentary, back then, and were mainly only used as proof of concepts. I tried my hand at [training a model to generate Shakespearean texts](https://colab.research.google.com/drive/10OWWTdb3U-wFB5MEKRCMlqB4NOzp41WL?usp=sharing) using Tensorflow and Keras, which didn't go as well as I would've hoped.

Then, I learned about convolutional neural networks (CNN) and auto encoders, and experimented with creating an [image compression algorithm](https://colab.research.google.com/drive/1nDkpY99SaBFeXIxLrSN5CYawbz1ZBmjX?usp=sharing) that could compress an i 32 x 32 color image into a 2 x 2 color grid. At that point, another model would decompress it, to attempt to return it back into it's original size. I would try this also [without CNNs](https://colab.research.google.com/drive/1oQEdEWMNo-QZgADaiL5TFD3Hgi8btBzK?usp=sharing) , but that would ultimately result in failure as well.

As time progressed, it became time for my 8th grade science fair. Still riding on the high of my rudimentary "AI research," I decided to try to create an AI model completely from scratch that would parse and detect malicious HTTP requests. I would package this up into a Python module, and ship it as a proxy server to put in front of other web servers. Surprisingly, it worked. I submitted my work and won first place. I was so proud of it, that I uploaded my [project to GitHub](https://github.com/kaptcha0/Quasar-Firewall/tree/main) .
## BANN research
When time came to write my Extended Essay (EE) for the International Baccalaureate (IB) Programme, it was only natural for me to try to continue my passion for AI. However, I didn't want to just try to make the [Quasar Firewall](https://github.com/kaptcha0/Quasar-Firewall/tree/main) better. I decided to go back to basics, and try to restructure the entire architecture of the AI.

I realized that most other human innovations are done by trying to imitate nature. "So," I thought, "Why not try this with neural networks?" And so, that became my research project, modeling biological neurons in code, then tying them together to make a *Biologically Approximated Neural Network*.

My goal was to try to use this new architecture to create a model that can accomplish a task with a comparable accuracy to a traditional ANN, as well as using significantly less processing power and memory. So I sat down for a period of about a year and a half, learned as much as I could about neurons, and tried to create small functions that would replicate the rudimentary behaviors. I tried my best to do have a 1:1 parallel, but since the realm of neuroscience is still ongoing, I worked with as much as I could get my brain to understand in this time-frame.
## publication
After submission to the IB organization and getting my results back, I thought it would be best for the community to publish my research. I'm not a "professional" researcher, I'm just a boy with ideas, but I thought this idea was at least worth looking into more. If this idea indeed does have merit, it could be a revolutionary shift in the AI world, where LLMs could run locally on a budget smartphone. 

I go into more detail as to the architecture and reasoning behind everything in the actual paper, so if you have any questions, please let me know. So without further ado, I present my research paper: [Mathematically Modeling a Biological Neural Network](/LBQ-730.pdf)

I'm also including the complete metrics and logs from the run [here](/Combined%20Metrics.xlsx).
