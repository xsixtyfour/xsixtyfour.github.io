---
layout: post
title:  "Dangling DNS"
date:   2022-03-10 13:30:45 +0100
categories:
---
<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
<figure class="highlight"><pre><code class="language-yaml" data-lang="yaml"><span class="s">cat ~/dangling-dns.yml</span></code></pre>
<span class="na">> Author</span><span class="pi">:</span> <span class="s">x64</span><br>
<span class="na">> Inserted on</span><span class="pi">:</span> <span class="s">2022-03-10 12:32:22 +0000</span><br>
<span class="na">> Total Words</span><span class="pi">:</span> <span class="s">1042</span><br>
<span class="na">> Estimated reading time</span><span class="pi">:</span> <span class="s">5 Minutes</span>
</figure>
==========================================
#  What is Dangling DNS?
In order for us to fully understand what dangling DNS is, we need to talk about the basics of DNS. In a very simplified way, DNS is a protocol that translates user-friendly domain names so they are easier to remember compared to a numerical IPv4 address. The IP Addresses that belong to each domain are stored within authoritative DNS servers that act like phone books for the internet. I'm not sure if that comparison is relevant to the younger audience anymore, I can't remember the last time I've seen a phone book, but you get the idea. When you open up a web browser, and type in a website, the browser will connect to a recursive DNS server and ask "what is the IP Address for x64.coffee? The recursive DNS server will send that query to the authoritative server for the answer. 

## What is a CNAME record?
A Canonical Name (CNAME) Record is used in DNS to create an alias from one domain name to another. All CNAME Records must point to a domain, and never to an IP Address. 

## Common use cases for CNAME Records 
* Provide a second hostname for network services such as FTP, or Email
* Registering a domain name in several countries and pointing the country versions to the main ".com" domain.
* Pointing several websites that are owned by one company to their main website.
\
\
An example of a CNAME Record
<img src="/images/CNAME-Record.png"
width="550" 
height="auto" />

## What is a Dangling Record?
An issue with CNAME Records can show up when a company decides to deprovision a website resource to eliminate the need for the subdomain. However, if the company does not remove the CNAME entry from their authoritative DNS server it will be left dangling. 
\
This is where it can be exploited. Lets say you own shop.x64.coffee and you're using Azure as an authoritative DNS server. I'm going to create a CNAME Record for my new subdomain shop.x64.coffee and point it to shop-coffee.westus2.cloudapp.azure (my web servers address). If I decide to deprovision that website by decommissioning that web server, but I don't remove the CNAME Record for shop.x64.coffee, a threat actor can go into Azure, spin up a server and set the DNS record to shop-coffee.westus2.cloudapp.azure. From that point forward, they fully control what is being served to shop.x64.coffee, furthermore, they can go to Azure App Service and request a managed certificate for shop.x64.coffee. It will check our DNS Zones to verify if that record exists, and since it does exist in our zone, they'll be provided with an SSL Certificate. If we had a wildcard cookie for *.x64.coffee, they also have access to that. If we have cross-origin resource sharing, they can attack with that information. It is important to minimize your attack surface, and make sure you're auditing your CNAME entries to remove any instances of Dangling DNS. 
\
<img src="/images/Dangling-DNS.png"
width="550" 
height="auto" />

# Bug Bounties! 

There is money to be made here by finding domains that can be taken over and reporting them through bounty hunter programs. I've dropped some well known sites below, but there are many more. Find which one you like the most. 
- [HackerOne](https://www.hackerone.com/)
- [Bugcrowd](https://www.bugcrowd.com/)
- [Intigriti](https://www.intigriti.com/)

## Can you take over?
We need to identify which services can be taken over. You can find up to date list of services with dangling DNS records at the site below.
[Github - Ed0verflow](https://github.com/EdOverflow/can-i-take-over-xyz)
\
If you'd like to dive even deeper into these topcs, I've outlined some resources below. 

- [Subdomain Takeover: Basics](https://0xpatrik.com/subdomain-takeover-basics/)
- [Subdomain Takeover: Going beyond CNAME](https://0xpatrik.com/subdomain-takeover-ns/)
- [Subdomain Takeover: Proof Creation for Bug Bounties](https://0xpatrik.com/takeover-proofs/)
- [Subdomain Takeover: Finding Candidates](https://0xpatrik.com/subdomain-takeover-candidates/)

## How do you identify vulnerable domains?

We can start with enumeration. We need to prepare a subdomain list, and we can do that with [Subfinder](https://github.com/projectdiscovery/subfinder). It's a subdomain discovery tool that discovers valid subdomains for websites by using passive online sources. It has a simple modular architecture and is optimized for speed. subfinder is built for doing one thing only - passive subdomain enumeration, and it does that very well.

<br />
{% highlight vb linenos %}
subfinder -d example.com -o subdomainlist.txt -t 50
subfinder -dL domainlist.txt -o subdomainlist.txt -t 50
-nW - Remove Wildcard & Dead Subdomains from output
{% endhighlight %}


## Is Subdomain Takeover Possible?

Lets check if it's possible to takeover one of the subdomains from the prepared list. You can manually check using the [dig](https://en.wikipedia.org/wiki/Dig_(command)) command.
<br />
{% highlight vb linenos %}
dig example.com
dig -f subdomainlist.txt > dig.txt
{% endhighlight %}
\
Then we check for status: NXDOMAIN and CNAME pointing to Dangling DNS. 

We can script this process out instead, it's much faster and more efficient. We'll use [Takeover](https://github.com/m4ll0k/takeover).
<br />
{% highlight vb linenos %}
python3 takeover.py -l subdomainlist.txt -v -t 50 -o output.txt
python3 takeover.py -d example.com -v -t 50 -o output.txt
{% endhighlight %}

## Takeover and Proof of Concept

If you are lucky and get a successful hit, we need to register a service/resource or bucket with the same name as the one we discovered. Redirect it to your web server with a PoC placeholder. We can utilize Azure Traffic Manager to achieve this for free. Create a free subscription on [Azure](https://portal.azure.com). Go to Home > New > Traffic Manager profile > Create traffic manager profile. Create it with same name as the subdomain that was successfully hit. Once we input the subdomain name, we will see if it's available to register. 
<br />
- Name: 'Subdomain'
- Routing method: Performance
- Subscription: your_subscription
- Resource group: Create new
- Name: PoC
- Resource group location: eg. West US 2
\
\
Now we need to point this domain to one that we control and create a virtual host with a landing page. It is very important to **not** publish anything on the index page. It is best practice to serve an HTML file on a hidden path containing a secret message inside an HTML comment. This would be enough to demonstrate the issue successfully. After this, create a detailed report and submit it on one of the bounty hunter websites I've listed above. Here is a great example of a report by 0xpatrik on [HackerOne](https://hackerone.com/reports/388622) for a starbucks.com subdomain. 

## How can you protect your infrastructure?

Microsoft has released a guide on [Subdomain Takeover](https://docs.microsoft.com/en-us/azure/security/fundamentals/subdomain-takeover) and describes the common security threat of subdomain takeover and the steps you can take to mitigate against it.

