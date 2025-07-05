---
title: "homelab the right way 101: planning"
description: I'm rebuilding my homelab from scratch with a focus on automation, security, and scalability. Using tools like Proxmox, Terraform, Ansible, and k3s, I’m creating a fully GitOps-managed setup inspired by Mischa van den Burg. In this post, I cover my infrastructure plan, network segmentation, and essential services like Plex, Home Assistant, and DVWA. Perfect for anyone into homelabs, DevOps, or cybersecurity.
published: true
date: 2025-07-05
tags:
  - homelab
  - homelabbing
  - planning
image: ''
---

# introduction

Hello all, thanks for checking out my blog again! Over the past couple days, I've been tackling a new project. Well, if I'm going to be honest, I've been revisiting a project that I had started working on last year. My homelab.

If I'm honest, my homelab wasn't much before. It consisted of an old Dell laptop running Proxmox off of a 1TB HDD. That instance had 4 machines: Truenas (which was a pain to set up, by the way) and 3 other machines running docker containers for different purposes. This was horrible for me, specifically the Docker VMs. I had to `ssh` into nodes to make changes and there was no central configuration. It took up a lot of time to maintain, and to be frank, I gave up on using it.

This got me thinking on what my original plans for this homelab were. I wanted a sort of private infrastructure that I could learn and test things out on. So I decided to scrap everything and start from scratch. This time, I promised to take the time to research and plan everything out thoroughly.

So welcome to my adventures in as I homelab the right way.

# planning

I stumbled across a video by Mischa van den Burg where he outlined how his homelab is set up. You can go watch it [here](https://youtu.be/WfDwFvl5XBo?si=pckxMDQSORhG6lAp):

<div>
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/WfDwFvl5XBo?si=oYQKlgfu43VWi6OC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

He pretty much outlined how he built his homelab in a way that's declarative and easy to document and modify. Taking heavy inspiration from this, I decided to build a similar homelab.

> 💡 Keep in mind
> 
> as of right now, I have surface-level knowledge on what I'm going to be talking about. I did some very rudimentary planning (with the help of our dear friend, ChatGPT) and decided to use those tools based off of industry standards. Don't worry, though. I'll do a deep dive on things as they come up.



## infrastructure

I decided manage the infrastructure and everything using Terraform, Ansible, and Kubernetes:

- Terraform would be for provisioning Proxmox VMs or LXE Containers,

- Ansible for automatically installing any tools (such as Tailscale or k3s) on each VM/Container

- Kubernetes (via k3s) for running any services I'd want (we'll get into that later)

I also decided that I want everything to be GitOps based. To my understanding, that means that

- My git repo is the only source of truth for how my homelab is managed

- Changes to the git repo are automatically pushed to the homelab

Now, I may be missing some things, so I'll definitely look into how to implement that properly.

## monitoring

Taking inspiration from Mischa, again. I wanted to use the Grafana suite to monitor all my services. I decided on using Loki, Prometheus, and Grafana Alerting to keep tabs on everything, including maybe even devices outside of my homelab (no idea if this will even work, but we'll see).

## security

As an aspiring Cybersecurity Analyst, I want this homelab to be secure by design. That means more than just installing a firewall and calling it a day. I’m planning to implement multiple layers of protection.

First, I’ll be setting up **segmentation**. Each workload will be placed in its own isolated environment depending on its purpose:

- **Production** – services that are safe and meant to be exposed to my home network

- **Development** – only accessible via Tailscale, isolated from prod

- **Volatile** – used for temporary or risky services that can access the internet but are cut off from the rest of the network

- **Cyber education** – things like DVWA and intentionally vulnerable apps; accessible through Tailscale

- **Administration** – only allowed to interact with production

- **Infrastructure** – completely isolated to minimize attack surface

This way, even if something gets compromised, the blast radius stays small.

I also want to run an **IDS/IPS** to keep an eye on things. The idea is to monitor for suspicious traffic and get alerts when something looks off. Ideally, I’ll have alerting hooked into email or even mobile notifications so I can react fast. It might be a bit much for now, but the goal of this project is to learn

## services

Here’s a breakdown of what I plan to run in the homelab, grouped by purpose.

### admin

These are the services that will keep the homelab running smoothly and let me see what’s going on under the hood.

- **Grafana Loki** – log aggregation

- **Prometheus** – metrics collection

- **Grafana Alerting** – custom alerting rules (CPU, RAM, disk usage, etc.)

- **Syslog server** – will collect logs from VMs, Kubernetes pods, and (hopefully) even external devices like routers or smart devices on my home network

### homenet

These are more for day-to-day quality of life:

- **Plex** – for media

- **Home Assistant** – smart home control

    - I might end up running this as a standalone VM instead of in Kubernetes, just because it’s a bit finicky

- **Pi-hole** – DNS-level ad blocking

- **Nextcloud** – for files, photos, and syncing

    - Backed by **TrueNAS** for storage

### cyber

This segment is dedicated to learning and testing cybersecurity tools and concepts.

- **DVWA** – the classic

- Other intentionally vulnerable apps or CTF machines as needed

- I’ll isolate this segment pretty tightly so that if I break something, it doesn’t take out the rest of the network

### development

This is kind of the wildcard segment. Whatever I’m currently working on — maybe a web app, maybe an API, maybe some tool I’m building — it’ll live here. I’ll spin up whatever I need as it comes up.

### infrastructure

Here’s the core stack that powers everything:

- **Flux** – GitOps controller that keeps the cluster in sync with the repo

- **Terraform** – provisions VMs on Proxmox

- **Jujutsu (jj)** – experimenting with this instead of traditional Git for version control

- **k3s** – lightweight Kubernetes distro

- **Longhorn** – persistent storage layer, backed up to TrueNAS

- **MetalLB** – load balancing for external IPs

- **Traefik** – ingress controller

- **Cilium** – Kubernetes CNI with built-in security policies

Control nodes will run **Ubuntu or Debian**, but all the worker nodes will use **Alpine** to keep things lightweight.

# gitops

One of the biggest goals with this homelab is to make everything GitOps-based.

To me, GitOps means that my **Git repo is the single source of truth** for the entire homelab. Everything — VM definitions, Kubernetes manifests, Helm charts, secrets, you name it — lives in version control.

Whenever I make a change (like editing a Helm values file or adding a new service), I commit it to the repo. Then **Flux** watches the repo, sees the change, and applies it to the cluster automatically.

This has a few big advantages:

- I can **rebuild everything from scratch** if I need to — and it’ll look exactly the same

- I get a full **history of changes** (especially helpful when I break something)

- I can **collaborate** or share my setup in the future

- And most importantly, I don’t have to SSH into nodes and manually tweak things anymore 🙏🏿

For secrets, I’m planning to use **SOPS** with **AGE** for encryption. That way, I can safely commit encrypted secrets to the repo and still have them decrypted automatically when Flux applies the manifests.

Eventually, I want this to be so well-automated that I can wipe my Proxmox host and rebuild the entire cluster from a clean slate just by cloning a repo and letting everything run.


That’s it for now. I’ll post updates as I go — probably starting with the Terraform and Ansible setup for provisioning VMs. If you’ve got suggestions, feel free to drop them my way. This is a work in progress, but I’m excited to finally be doing it right.

