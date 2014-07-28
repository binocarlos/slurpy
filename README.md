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

## docker

To run as a docker container - you must mount the folder as a volume.

You must pass a routable address for etcd from within the docker container.

To push:

```bash
$ docker run --rm -v /home/myconfigs:/myfiles binocarlos/slurpy push --folder /myfiles --key /myfiles --etcd 192.168.8.120:4001
```

To pull:

```bash
$ docker run --rm -v /home/myconfigs:/myfiles binocarlos/slurpy pull --folder /myfiles --key /myfiles --etcd 192.168.8.120:4001
```

## globs

when pushing - you can provide a `--glob` argument which will filter the local files:

```bash
$ slurpy push --folder /home/myconfigs --key /myconfigs --glob *.txt
```

## api

```
usage: slurpy push [options]
usage: slurpy pull [options]

options:

  --folder - the local folder
  --key - the etcd key
  --glob - a file glob to match local files being pushed
  --etcd - the address of an etcd cluster
```

## license

MIT