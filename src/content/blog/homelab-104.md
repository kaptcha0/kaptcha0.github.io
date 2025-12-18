---
title: homelab the right way 104
subtitle: Nix-ify everything!
description: We explore converting the existing system to Nix
published: true
date: 2025-12-18
tags:
  - terraform
  - homelab
  - nix
  - ansible
---
I have a confession. I'm a Nix-aholic. I mean, take a look at my [dotfiles](https://github.com/kaptcha0/dotfiles). It's all maintained and managed by Nix. There was even a period of about 6 months where I daily drove NixOS on my personal laptop. So when I realized that I could Nix-ify my entire homelab, I jumped on the opportunity. That's what we're going to explore in this article.
## what is Nix?
Before all that, though, it's worth explaining exactly what I'm talking about. If you haven't heard, [Nix](https://nixos.org) is a declarative build system, sort of like CMake. It allows you to package anything into a self-contained *derivation*.

When I say anything, I mean **anything**. I've seen use cases from packaging a Rust application, to generating a configuration file, to ricing an entire Linux desktop exclusively done with Nix.

The great benefit of Nix over other build systems, like Makefiles for example, is that the configuration files are relatively simple and structured. Nix code is pretty much JSON as a functional language, so it's easy to parse. I won't be going over the language, but you can look more into it [here](https://nix.dev/tutorials/nix-language.html).
## why Nix?
That's honestly a good question. I mean, tools like Ansible and Terraform exist, which I have already been using. Why try to migrate everything over to this new build system?

My first reason is the novelty of it. I think it's a cool tool to play around with. Since it's so versatile, learning how to use it might prove beneficial later on.

Apart from that, I **HATE** Ansible. The YAML files don't make sense to me, and it seems like a roundabout way to doing what I want. Remember, I'm only using Ansible here to install and do the basic configuration for my k3s cluster. However, opening up the code-base to try to make any changes broke things, more often than not.

Nix fixes my Ansible problem because it's something I've already gotten used to. The configuration is uniform and easy to read. Apart from that, I can easily deploy a Nix/NixOS configuration to any NixOS installation using a tool called [NixOS-Anywhere](https://github.com/nix-community/nixos-anywhere). Then, I could easily push updates to these installations using the same tool without worrying about conflicts, unlike Ansible.

I have no real issue with Terraform, but since I'm already this far into it, so I might as well convert this as well.
## how to Nix-ify?
Essentially, I plan to do as much as possible with Nix. This includes
- provisioning my VMs on Proxmox
- installing and configuring any services on any of the VMs/servers like k3s, Docker, ssh, etc.
- maybe creating a router?? (I'm looking into this right now, blog post incoming)
### provisioning
Terraform was already handling the provisioning step. It's the industry standard, and I've already found a good provider to automagically interface with the Proxmox API and create my VMs, pools, and whatever else I need.

Converting this to Nix is pretty straight forward. It turns out that Terraform doesn't necessarily need to use the HCL language for it to work. It also supports a JSON config file! With this in mind, a brilliant mind created a Nix tool that compiles your Nix configuration into a JSON file for Terraform to use, called [Terranix](https://github.com/terranix/terranix). It's fairly 1-to-1 with Terraform's HCL, so converting my existing code to Nix was fairly straightforward.
### configuring
I've already mentioned my hatred for Ansible above and briefly talked about the Nix tool I plan on using to circumvent that. Essentially, my plan is to create Debian VMs on Proxmox with Terranix and output the IPs to a JSON file. Then I'll use NixOS-Anywhere to convert the existing Debian installations to NixOS installs, and push my configuration file to each host using said JSON file.

> Why not directly install a NixOS image with Terranix? Well, it's because I want to get the IPs. For Proxmox to be able to get them, it needs QEMU guest agent to be running in the VM. Debian has this preconfigured in it's cloud-image.
> Because of the way NixOS is structured, though, it does not ship with QEMU guest agent. I could get around this by building my own NixOS image, but that's more work than it's worth. This is the simplest, most straight-forward way that I've come across to get this done.
### routing??
I was virtualizing RouterOS by MikroTik before without too many hiccups. I would create a basic configuration with API access manually, then use Terraform to do the rest of the work. The main reason I'm considering creating my own router is because converting all that HCL code to Nix was going to be a very big hassle.

Apart from this, I think it would be a good way of understanding what exactly goes on within a router. I mean, things like pfSense and even RouterOS are abstractions from what is really going on behind the scenes. They give you pretty UIs to click around and configure, where everything is neatly labeled and has good documentation. I think stripping away the abstraction would be a good way to go back to the basics and understand what makes a router tick. Plus, it allows me to configure and deploy it just like another NixOS server!

## conclusion
Yep, that's pretty much all I got. As of today, I've [already converted my Terraform configuration to use Terranix](https://github.com/kaptcha0/homelab/tree/bf314c2f81c92d4f09dce3cbf684e5c52ffd51c6), and it works as intended. I have yet to start on NixOS-Anywhere, but I'll be doing that in the coming weeks. If you have any questions or suggestions, feel free to reach out.

Thanks again for stopping by!