FROM 		binocarlos/nodejs
MAINTAINER 	Kai Davenport <kaiyadavenport@gmail.com>

ADD . /srv/slurpy
RUN cd /srv/slurpy && npm install

ENTRYPOINT ["/usr/local/bin/node", "/srv/slurpy"]
CMD [""]