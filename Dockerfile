FROM node:14-slim
# alpine not compatible with TFJS https://github.com/tensorflow/tfjs/issues/1425
WORKDIR /app
COPY package.json ./

# npm rebuild @tensorflow/tfjs-node --build-from-source seems required
# Lot of dependencies required for canvas node module (could make an image without viewer but ...)
RUN apt-get update && \
    apt-get install -y -q build-essential python3 make gcc git libc6-dev libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && \
    npm install --production && \
    npm rebuild canvas @tensorflow/tfjs-node --build-from-source && \
    if [ "$TARGETPLATFORM" = "linux/arm/v7" ] ; then \
    echo '{"tf-lib": "https://s3.us.cloud-object-storage.appdomain.cloud/tfjs-cos/libtensorflow-cpu-linux-arm-1.15.0.tar.gz"}' \
    > node_modules/@tensorflow/tfjs-node/scripts/custom-binary.json; fi && \
    rm -rf /var/lib/apt/lists/*

# For the if see https://github.com/yhwang/node-red-contrib-tf-model#note (make TFJS works on Raspberry PI / ARM)

COPY default.json .
COPY plugins ./plugins
COPY start.js .

ENTRYPOINT [ "node", "start.js" ]
CMD [ "-c", "default.json" ]
