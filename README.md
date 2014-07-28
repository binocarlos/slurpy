slurpy
------

Replicate local files matching a glob into etcd

## install

```bash
$ npm install slurpy -g
```

or if you can [install docker](https://github.com/binocarlos/docker-install) to use the docker image

## usage

slurpy will copy matching files into etcd keys matching the filepath.

If we have a folder (/home/myconfigs) with the following files:

 * /config/test.json
 * /data/apples.txt

Both of these files contain text content - slurpy does not work with binary files (and so is ideal for config scenarios)

To commit these files to etcd:

```bash
$ slurpy push --folder /home/myconfigs --key /myconfigs --etcd 127.0.0.1:4001
```

To pull those files from another etcd:

```bash
$ slurpy pull --key /myconfigs --folder /home/myconfigs --etcd 127.0.0.1:4001
```

To continously pull updates:

```bash
$ slurpy pull --key /myconfigs --folder /home/myconfigs --etcd 127.0.0.1:4001 --wait
```

## api

```
usage: slurpy push [options]
usage: slurpy pull [options]

options:

  --folder - the local folder
  --key - the etcd key
  --filter - a file glob to match local files being pushed
  --etcd - the address of an etcd cluster
```

## license

MIT