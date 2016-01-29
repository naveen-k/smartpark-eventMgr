FROM tampalab-prov.vici.verizon.com:9000/irvui/busybox-node
#FROM irvui/busybox-node:4.2.2

MAINTAINER Daniel Scholl <Daniel.Scholl@verizon.com>

COPY dist /opt/app
WORKDIR /opt/app

RUN npm install --production
RUN adduser -S verizon
RUN chown -R verizon:verizon /opt/app

# This specifies what MongoDB Endpoint to use
# Valid values: redis or file

USER verizon
EXPOSE  8081

CMD ["npm", "start"]