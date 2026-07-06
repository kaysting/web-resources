# Executable Bash Scripts

A collection of bash scripts useful for new server setup, executable via curl and this repository's public domain.

## Update and upgrade

Run apt update and apt upgrade. Requires sudo.

```
curl https://src.kaysting.dev/sh/update.sh | bash
```

## Lockdown SSH

Disable SSH password authentication, ensuring only keys can authenticate.

```
curl https://src.kaysting.dev/sh/lockdown-ssh.sh | bash
```

## Install essential packages

Installs essential, commonly used packages. Requires sudo.

```
curl https://src.kaysting.dev/sh/install-essentials.sh | bash
```

## Install NVM and Node LTS

Install Node Version Manager and the current LTS version of Node.js as the current user.

```
curl https://src.kaysting.dev/sh/install-nvm.sh | bash
```
