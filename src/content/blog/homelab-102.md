---
title: homelab the right way 102
subtitle: proxmox and provisioning
description: Figuring out how to set up Terraform, Proxmox, and a basic Kubernetes cluster
published: true
date: 2025-07-08
tags:
  - homelab
  - kubernetes
  - ansible
  - terraform
  - proxmox
  - k3s
---

Terraform was a beast to set up. Like, really. I think I spent about 4 days just trying to figure out how to provision Proxmox VMs with Terraform, create Ansible playbooks, and install k3s.

Strap in, 'cuz this will be a long one. I guess it's all part of the journey to homelab the right way.

> Psst. Interested in following along? Check out my repo: [kaptcha0/homelab](https://github.com/kaptcha0/homelab)

## terraform + proxmox, the bane of my existence

This was by far the worst and most tedious part of setting up this homelab. To understand why, it's best to get an idea of what Terraform is.

### terraform overview

[Terraform](https://developer.hashicorp.com/terraform) is a tool that is ordinarily used to provision cloud environments such as AWS, GCP, and Azure. It's popular because of it's infrastructure-as-code approach, making it easy to have a declarative workflow that can be quickly iterated and automated with ease.

The way it works is through Terraform's _providers_, which are sort of like plugins that allow the Terraform CLI to interface with various cloud APIs and provision machines, create networks, and generate policies in the cloud environment.

Because of my goal of having a declarative, GitOps based homelab, I thought it would be a great tool to work with, not only because of it's popularity in the industry, but also because it supports my virtualization tool of choice, Proxmox.

### proxmox overview

What is Proxmox? [Proxmox Virtual Environment](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview) is an open-source virtualization tool, sort of like VMWare Workstation or VirtualBox. The difference is that while VMWare works as a desktop hypervisor, Proxmox works on bare metal.

The technical term for this is that Proxmox is a _type 1 hypervisor_ and allows you to run virtual machines (using KVM) and containers (using LXCs). VMWare Workstation and VirtualBox are _type 2 hypervisors_, which run as an application on your desktop and only support running virtual machines.

While yes, PVE has other features, I'm not focusing on them right now, since they're not applicable to my setup for the moment. I'll look into setting up clustering and other features as my homelab grows.

### setting it up

As I said before, making Terraform and Proxmox work together nicely took a lot of time. Most of the hassle came with finding and running the Proxmox provider for Terraform. Believe it or not, a good number providers are not maintained by HashiCorp (Terraform's authors). Instead, they are made and maintained by the community, with individuals making providers for tools that they use.

Originally, I used the [Telmate/proxmox](https://registry.terraform.io/providers/Telmate/proxmox/latest) provider. I had huge problems with the API token which didn't allow me to even access the Proxmox API. Eventually, I just gave up, and upon further research, came across the [bpg/proxmox](https://registry.terraform.io/providers/bpg/proxmox/latest) provider, which ended up working just fine. To be honest, I have no idea what the issue was with the Telmate provider, but all that matters is that this one worked.

After finally setting up the provider, and making sure that I could create VMs on my Proxmox node with Terraform, I moved on to setting up a template that I can easily clone, customize, and deploy to provision my Kubernetes cluster.

#### bootstrapping with cloud-init

From my understanding, cloud-init is a tool that allows you to bootstrap a VM on it's first boot. Following [Matt Edward's blog post](https://mattedwards.org/2024/07/using-cloud-init-with-proxmox-vms) I used it to:

- attach memory and storage to the image
- create a network adapter and attach it to the image
- enable cloud-init options
- attach a console
- enable QEMU guest agent, so Proxmox can get info about the VM

One thing to note is that when attaching the storage to the template, make sure to chose something small, as you will not be able to chose anything smaller than that when cloning the template. In my case, I chose 8GB.

After creating my template, I ended up having a debian template with an ID of 1000 inside of Proxmox.

![VM template 1000](/imgs/blog/homelab-102/vm-template-1000.png "Debian template configuration")

#### terraform configuration

After successfully setting up my template, I proceeded to finally provision my Kubernetes cluster. If you want to see my entire Terraform config, check it out [here](https://github.com/kaptcha0/homelab/tree/6bcb2a3870d26fa391b4920b1f08da15553c33c2/terraform). But I'll just be going over my methodology in provisioning my VMs.

From the get-go, I realized that my Proxmox node could only probably handle 3 extra VMs. Keep in mind, I already have a Truenas instance which has the ability to use up all of my system resources (I'll be moving this to it's own machine as soon as I can, don't worry). As such, I decided that a 3 node cluster, with 1 control node and 2 agent nodes.

Below is the configuration I decided to go with.

```hcl
// terraform.tfvars
// ...

vm_template_id = 1000
vm_storage     = "local-lvm"
vm_bridge      = "vmbr1"
vm_user        = "terraform"
vm_timeout     = 60 * 60 // the default timeout wasn't enough for my slow pve instance, so i changed it to an hour

// server config
k3s_server_count     = 1
k3s_server_cores     = 1
k3s_server_memory    = 2048
k3s_server_disk_size = 8

// agent config
k3s_agent_count     = 2
k3s_agent_cores     = 1
k3s_agent_memory    = 2048
k3s_agent_disk_size = 32

// ...

```

After all of this, I had configured Terraform to:

- create 3 VMs for k3s cluster
- create a seperate network for my machines on the `10.10.10.0/24` subnet using the `vmbr1` interface
- block inbound and outbound access to my home network (`192.168.1.0/24`) from `vmbr1`

> Note: With this basic set up, the VMs on `vmbr1` would not have internet access. I'll talk about how I fixed this issue later on.

## ansible

[Ansible](https://ansible.com/) is another well known tool for automation. It works by using _playbooks_, which are pretty much instructions for what to do on a host or set of hosts in your _inventory_. I used two playbooks: one to set up NAT on the Proxmox host to allow internet access, and another to install and configure k3s on the control and agent nodes.

### networking

Since a big goal of this homelab is security, I opted to create another virtual interface for all my Kubernetes nodes to live on, `vmbr1`. This would allow me to isolate the VMs from my home network. However, I still needed to be able to access my VMs from my local machine, at least. Since I was already using Tailscale to administer my Proxmox instance from anywhere, I decided to enable it as a subnet router and exposed the `10.10.10.0/24` subnet to my tailnet.

> For those who aren't aware, [Tailscale](https://tailscale.com/) is a peer-to-peer mesh VPN service that allows you to connect devices together, forming a _tailnet_.
> It also has the ability to expose a subnet to the rest of the tailnet by using a _[subnet router](https://tailscale.com/kb/1019/subnets)_. Which forwards packets for the designated subnet to the device that exposes it.

As for internet accessibility, I solved this by enabling network address translation (NAT) on Proxmox. While I could've done this manually on the host, I decided to use Ansible, since (a) it goes hand-in-hand with my declarative approach and (b) these commands wouldn't last on reboot, so I'd have to run them again every time my Proxmox host reboots.

> Yes, I could've made the NAT rules persistant, but I prefered using Ansible since it's declarative.

And so, I used the following playbook to enable NAT:

```yaml
---
- name: Configure NAT on Proxmox host
  hosts: pve
  become: true
  tasks:
    - name: Enable IP forwarding
      sysctl:
        name: net.ipv4.ip_forward
        value: "1"
        state: present
        reload: yes

    - name: Set up NAT for vmbr1
      iptables:
        table: nat
        chain: POSTROUTING
        out_interface: vmbr0
        source: "10.10.10.0/24"
        jump: MASQUERADE
```

### installing k3s

Installing Kubernetes was also pretty straight forward. I decided to go with [k3s](https://k3s.io/), since it's lightweight, easy to set up, and has tons of resources in case I run into trouble.

 I again decided to use Ansible to install and configure k3s for the sake of being and staying declarative. I essentially followed [this article](https://dev.to/hatati/cook-up-a-k3s-cluster-on-raspberry-pies-with-ansible-4bb4), since I didn't want to clone the [official k3s installation repository](https://github.com/k3s-io/k3s-ansible) into my own repo. Apart from that, I also wanted to be able to understand each line of what I was writing for debugging purposes, so I chose to follow the tutorial.

The only modifications I really made was changing how the "bootstrap server" as it's called in the article, is selected. Instead of manually selecting one, using the power of ChatGPT, I was able to figure out how to make it randomly select one from the group in my Ansible inventory called "k3s_servers". While I only have one server in there now, this is going to allow me to scale this up to having as many as I want, and all I'd have to do is add their IPs to the inventory.

> One thing I haven't figured out yet is how to automatically add the IPs to the inventory based on the Terraform state. If you have any ideas, please reach out and let me know!

I accomplished this by using the following lines:

```yaml
# ...

      when: inventory_hostname in groups['k3s_servers']
      run_once: true

# ...
```

This essentially made Ansible pick the first host in the `k3s_servers` group and set it as the bootstrap server. The playbook also copied the kubeconfig file from there to my local machine.

---

With all that being said, I finally have a working Kubernetes cluster. From my local machine, I was able to run the `kubectl get nodes` and reach the cluster.

```sh
$ kubectl get nodes
NAME           STATUS   ROLES                  AGE    VERSION
k3s-agent-0    Ready    <none>                 106m   v1.32.6+k3s1
k3s-agent-1    Ready    <none>                 106m   v1.32.6+k3s1
k3s-server-0   Ready    control-plane,master   107m   v1.32.6+k3s1
```

What's next? I think I'll look at installing Flux finish up making this a GitOps Kubernetes homelab. Hopefully that post won't be as long :sigh:.

See you then!

