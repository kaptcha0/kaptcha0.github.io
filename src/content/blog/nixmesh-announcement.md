---
title: announcing nixmesh!
subtitle: a new orchestration tool built on Nix
description: In this post, I announce my latest project, NixMesh, a job orchestration tool inspired by Kubernetes, powered by Nix
published: true
date: 2026-04-09
tags:
  - nix
  - kubernetes
  - devops
  - project
  - devlog
  - nixmesh
---


I've been building my homelab for the last couple of months, and it's been going well — with one persistent headache. My setup ended up spanning three separate configuration systems: Terraform for provisioning, NixOS for machine configuration, and Kubernetes for workloads. Two different formats, three different mental models, one source of truth that was anything but. I wanted to collapse all of that into a single, unified configuration. [NixMesh](https://github.com/kaptcha0/nixmesh) is my attempt at that.
## motivation
Over the last couple of months, I've been steadily [building my homelab](https://kaptcha.cc/blog/tag/homelab/) . While I have made good progress, I've experienced the headaches caused by my specific approach.

The goal of the homelab was to have a declarative homelab, where the only source of truth was the repository. I did eventually get to that point, but the tradeoff was that I was left juggling 3 different configurations (Terraform, NixOS, and Kubernetes) in 2 different formats ( `nix` and `yaml` ). I wanted to consolidate as much of it as possible, so that all I have to do is maintain a single, unified, configuration.

After experiencing the joys of Nix first-hand, in both [my homelab](https://kaptcha.cc/blog/homelab-104/) as well as my [own system configuration](https://github.com/kaptcha0/dotfiles) , I decided that the best way to do this was using Nix.
## orchestration? why not kubernetes?
The obvious answer is Kubernetes. It's the industry standard, it runs everywhere, and MiniKube means you can run it on a single machine. But Kubernetes is built for a different problem than mine. It manages containers — it doesn't provision or configure the machines those containers run on. My goal was a single configuration that describes the entire cluster: the machines, how they're set up, what runs on them, and how they talk to each other. Kubernetes gets you partway there, but you still need something else for the machine layer, and that's exactly the seam I was trying to eliminate.

Tools like NixOps, Nixinate, and Morph get closer — they handle NixOS machine deployment, which is the missing piece Kubernetes leaves out. But none of them have a scheduler. You still have to decide manually what runs where, and there's no mechanism for the cluster to adapt when a node goes down or a job needs to move. I wanted the declarative, self-healing properties of Kubernetes applied to the full stack, expressed entirely in Nix. That combination doesn't exist yet, so I'm building it.
## follow along
To make this concrete: here's what a minimal NixMesh cluster declaration looks like today. You describe your nodes, declare your jobs and what they need, and NixMesh handles placement, ingress, secrets, and ongoing updates — all from a single flake.nix. You can see the current example [here](https://github.com/kaptcha0/nixmesh/tree/main/examples/basic-example) .

This is early. The schema is settled and the toolchain is wired together, but the scheduler and several library functions are still being implemented. I'll be writing about each piece as it comes together. If you're a Nix person who's felt the same friction, I'd love to have you follow along — or jump in.