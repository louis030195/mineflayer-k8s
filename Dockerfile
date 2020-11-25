FROM node:14-slim
# alpine not compatible with TFJS https://github.com/tensorflow/tfjs/issues/1425
WORKDIR /app
COPY package*.json ./

# npm rebuild @tensorflow/tfjs-node --build-from-source seems required
RUN apt-get update && \
    apt-get install -y build-essential wget python3 make gcc libc6-dev && \
    rm -rf /var/lib/apt/lists/* && \
    npm install --production && \
    if [ "$TARGETPLATFORM" = "linux/arm/v7" ] ; then \
    echo '{"tf-lib": "https://s3.us.cloud-object-storage.appdomain.cloud/tfjs-cos/libtensorflow-cpu-linux-arm-2.7.0.tar.gz"}' \
    > node_modules/@tensorflow/tfjs-node/scripts/custom-binary.json; fi && \
    npm rebuild @tensorflow/tfjs-node --build-from-source
    
# For the if see https://github.com/yhwang/node-red-contrib-tf-model#note (should make TFJS works on Raspberry PI)

COPY default.json .
COPY plugins ./plugins
COPY start.js .

ENTRYPOINT [ "node", "start.js" ]
CMD [ "-c", "default.json" ]
