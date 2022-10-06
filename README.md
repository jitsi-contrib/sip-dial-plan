# sip-dial-plan

This is a simple service which publishes SIP dialing plans for
`video SIP gateway`. It checks the token and sends the dialing plan as a
response if the token is valid.

The dialing plan is in [dial-plan.json](./dial-plan.json)\

#### installation

- Install packages as `root`:

```bash
apt-get install unzip curl git
```

- Install `deno` as `root`:

```bash
cd /tmp
wget -T 30 -O deno.zip \
    https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip
unzip -o deno.zip
cp /tmp/deno /usr/local/bin/

deno --version
```

- Get a copy of the repo (_don't run as `root`_):

```bash
git clone https://github.com/jitsi-contrib/sip-dial-plan.git
```

#### configuration

Update the following files according your environment:

- [config.ts](./config.ts)
- [dial-plan.json](./dial-plan.json)

#### running

Don't run as `root`:

```bash
cd sip-dial-plan
bash sip-dial-plan.sh
```
