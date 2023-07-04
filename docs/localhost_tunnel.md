# How to expose your localhost to the world

Exposing localhost publicly is only necessary when you want to develop widgets and have the code changes be reflected live on a remote production Uniweb instance.

When using a tunnel, you don't have to commit the changes in order for them to go live. You simply make changes to the code in your file system, and then let Yarn rebuild it automatically. You just have to reload a website linked to the collection whenever you want to see the results of your changes.

There are several services that can establish a secure connection between your localhost and the internet. Some of them are free, paid, or even pay what you want.

1. [PageKite](https://pagekite.net/)
2. [Cloudflare Quick Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
3.  [Cloudflare Local Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/#set-up-a-tunnel-locally-cli-setup)
4. [Ngrok Tunnel](https://ngrok.com/docs/secure-tunnels/)

## Configuring a tunnel service

In this section we show the steps to configure some of the tunnel services listed above.

### Tunneling with [PageKite](https://pagekite.net/)

This solution works well. it's easy to setup, and gives you a permanent URL. It requires python or python3. 

#### Installing PageKite CLI script

```bash
# download python version executable
$ curl -O https://pagekite.net/pk/pagekite.py 

# signup / create account
$ python3 pagekite.py --signup 

# login and start the tunnel
$ python3 pagekite.py [localhost_port_number] [yourname].pagekite.me 
```

#### Starting a PageKite tunnel

```bash
# start tunnel with previous settings
$ python3 pagekite.py 
```

### Tunneling with [Cloudflare Quick Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/do-more-with-tunnels/trycloudflare/)

The **quick tunnel** does not need the creation of an account anywhere but it generates a different URL every time a tunnel is opened.

#### Installing `cloudflared` CLI script

There are different [installation instructions](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) for each operating systems. In particular, for macOS:

 ```bash
 brew install cloudflared
 ```

#### Starting a Cloudflare quick tunnel

Run the following terminal command to start a free tunnel.

 ```bash
 cloudflared tunnel --url http://localhost:8080
 ```

The `cloudflared` script generates a **random subdomain** when connecting to the Cloudflare network and print it in the terminal for you to use and share. The output will serve traffic from the server on your local machine to the public internet, using Cloudflare’s Argo Smart Routing, at a public URL.

### Tunneling with [Cloudflare Local Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

This type of tunnel gets a permanent Cloudflare URL. You can also set custom URL by [configuring a DNS record](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/routing-to-tunnel/dns/).

Follow the instructions to [set up a tunnel locally](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/#set-up-a-tunnel-locally-cli-setup) using the CLI.

## Configuring a remote Uniweb website to use a tunnel to localhost

In your `.env.dev` file, configure the publicly accessible URL that points to your localhost. Also set the name of your target widget collection in `TARGET_MODULE`.

```bash
# A publicly accessible URL that points to localhost
TUNNEL_URL="the-public-tunnel_url"

# Name of the widget collection to build
TARGET_MODULE='name-of-the-collection'
```

Then run the command command

```bash
yarn watch:tunnel
```

The `watch:tunnel` argument builds in `development` mode with the `--watch` option, has the compiled files are locally stored, and modifies the `latest_version.txt` file as the local build changes. The destination directory is `build_dev/[name]`.

> You can also specify the name of the target collection when starting the script: `TARGET_MODULE=[name] yarn watch:tunnel`

### Setting the tunnel URL in a website

Select a website in your Uniweb and turn on its **dev mode** switch. When prompted, set the URL of the tunnel. For example, if using PageKite, the tunnel URL to the running widget collection would be `https://[yourname].pagekite.me/[collection_name]`.

![img.jpg](assets/websiteDevMode.png)
