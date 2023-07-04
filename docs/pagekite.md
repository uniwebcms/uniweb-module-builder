## Pagekite

This repository comes with a web server ready to go for development purposes. The server will run on local host on port **3005** and will need to be accessible from the outside world via a public URL. We can achieve that with a middleware server that would send traffic to localhost via a tunnel. A simple solution is to get and install [Pagekite](https://pagekite.net/).

You will be asked to create an account at Pagekite and to choose a name for your first "kite", which will be used to construct a permanent URL for your tunnel.

```bash
# download python version executable
$ curl -O https://pagekite.net/pk/pagekite.py 

# signup / create account
$ python3 pagekite.py --signup 
```

Now that you know the public URL for your local web server you must save it into the environment variable `TUNNEL_URL`. You can edit the existing `.env` file, or preferably, create a new file named `.env.dev` and add your environment variables in it.

```ini
TUNNEL_URL="https://[kite_name].pagekite.me"
```

You are all set for now. Once you run the web server at http://127.0.0.1:3005 and the "fly the kite", the `dist` folder of this repository will be accessible at `https://[kite_name].pagekite.me`