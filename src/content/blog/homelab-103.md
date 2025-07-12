---
title: homelab the right way 103
subtitle: Flux, SOPS, and Alerts
description: Setting up SOPS, FluxCD, and Discord Alerting
published: true
date: 2025-07-11
tags:
  - fluxcd
  - homelab
  - kubernetes
  - gitops
  - sops
---

In the [last post](/blog/homelab-102), I provisioned my VMs and got Kubernetes running with the power of Ansible and Terraform. It might seem like I can now finally start to start running services on my cluster, but that's not the case. For a true GitOps-backed homelab, I need to set up a system for *continuous delivery* so that updates to my Github repo are automatically reflected in my Kubernetes cluster.

For that, I chose FluxCD, and that's what I'll be setting up in this blog. Follow along as I homelab the right way.

> Psst. Interested in following along? Check out my repo: [kaptcha0/homelab](https://github.com/kaptcha0/homelab/tree/96e2f1267b55a8ac6fdde8dc4d95b475f992517d)

## flux

Let's go over FluxCD for a minute. [FluxCD](https://fluxcd.io) is a GitOps tool that automates the continuous delivery of a Kubernetes cluster. It fetches code from any Git repository (whether on GitHub, Gitlab, or a local repository), and applies the updates necessary so that the remote configuration is reflected in the local one.

This is exactly what I want for my homelab. I don't want to manually have to run `kubectl apply ...` for every change. I'd much rather write my manifest, push it to GitHub, and have it automagically appear in my cluster.

### bootstrapping

The set up process for Flux was pretty straight-forward, and **way** easier than setting up Terraform and Proxmox. It was as easy as following the [getting started documentation](https://fluxcd.io/flux/get-started/), and I was off to the races.

> One thing to note, though, is that Flux needs an API token to access and bootstrap your GitHub repository. This token needs all the `repo` permissions on your repository. I initially tried using Github's new "fine-grained tokens," but quickly found out that the Flux documentation was referring to the classic tokens.

I opted to set up my flux in the `cluster/homelab/` directory of my repository. And while I'm at it, it's probably best to talk about the directory structure of the repository.

### repo structure

Essentially, my homelab project repository is laid out like this:

- `./`
	- `ansible/` -> stores Ansible configuration
	- `cluster/homelab/` -> Flux/Kubernetes root directory
		- `apps/` -> store configuration for services and apps running on the cluster
		- `flux-system/` -> stores Flux config files
		- `infra/` -> stores services that manage the infrastructure of the cluster
		- `secrets/` -> stores Kubernetes secrets
	- `secrets/` -> stores secrets for services running outside of the k3s cluster (Terraform, Ansible, etc)
	- `terraform/` -> stores Terraform config

You may notice that I store and commit secrets to GitHub. While yes, this is an issue, since these secrets pose a security risk, it's necessary to keep them in the repository for the sake of reproducibility.

To mitigate the security risk posed, however, I opted to encrypt these secrets with a tool called SOPS.

## sops?

[SOPS](https://github.com/getsosps/sops) is a CLI tool that encrypts and decrypts sensitive files, usually those containing API keys, passwords, and other secrets. It's great because it only configures the sensitive values and not the keys, by default. 

For example, let's say I was given this `.env` file:

```sh
SUPER_SECRET_API_TOKEN=password123
```

Instead of encrypting and obfuscating the entirety of the file, SOPS would only encrypt the `password123` portion of it. And this works for almost everything, from YAML to JSON to INI files.

It also has a feature that enables you to edit encrypted files on the fly, and it automatically handles the encryption and decryption processes on it's own.

I opted to use it because it was already compatible with all the tools I was already using up to this point. If you had snuck a look at the repository the last time I posted, you would've seen that I had already committed my Proxmox API token to GitHub, but it was encrypted with SOPS. I used the [carlpett/sops](https://registry.terraform.io/providers/carlpett/sops/latest) provider to automatically handle decrypting my Terraform secrets on the fly.

This time, I'll be using it to encrypt my Kubernetes secrets before I push them to GitHub.

## flux + sops = perfect

Getting SOPS to work inside of Flux is a bit more involved than using it with Terraform. This is because my secrets are uploaded to the cluster as-is. And since it's a remote system that normally doesn't have access to the encryption keys created on my local machine, I had to upload said keys to the cluster before Flux could decrypt them for the rest of the cluster to use.

I predominantly followed [this excellent article](https://apurv.me/posts/kubernetes-gitops-with-fluxcd-part-2/), as the Flux documentation got a little confusing for me. The big thing I changed was using AGE instead of GPG. I had no real reason to use either, so I just followed the recommendation of ChatGPT (it said that AGE was more modern and usually used in GitOps workflows).

I created my AGE key using the following command:

```sh
$ age-keygen -o cluster/homelab/secrets/age.agekey

```

Then, I configured my SOPS configuration file in the `cluster/homelab/secrets/` directory to use the generated public key to encrypt the files in the directory.

> Note: By default, SOPS searches the the `~/.sops/keys.txt` file for public and private keys for encryption/decryption. Because my keys were in a strange location, I had to concatenate the `age.agekey` file into the default SOPS location so I could decrypt my files.

From here on out, I followed the rest of the tutorial, but substituted `sops-gpg` with `sops-age` wherever applicable.

With all this set up, I decided to set up a method of getting alerts from Flux via Discord.

## alerting with discord

Flux has a [built-in way to notify](https://fluxcd.io/flux/monitoring/alerts/) it's users of any issues or events that occur within the cluster. For the sake of observability, I chose to figure out how to get this to work.

I chose to use Discord, since it has the ability to have multiple different channels per server. I thought I could set up a single server for all my homelab-related notifications instead of relying on either email or SMS, which would all be a pain to set up and get working.

While I could've followed the official documentation, I found that [this article](https://apurv.me/posts/kubernetes-gitops-with-fluxcd-part-5/) by the same author was easier to digest.

> No idea if it's just me, but Flux's documentation is really confusing...

After I pushed this to GitHub, I was pleasantly surprised to see a little notification pop up in my "flux" channel of my homelab Discord server:

![Sample alert](/imgs/blog/homelab-103/discord-alert.png "Sample Discord alert from Flux")

---

With that, I had finally managed to set up a simple GitOps workflow into my Kubernetes cluster. I think next time, I'll try setting up Cilium, MetalLB, and other networking-based tidbits of the cluster. After that, I can finally start deploying services! 

Thanks for reading and make sure to tune in next time!
