FROM node:14-slim

### Cancer dependencies ###
# ENV TZ=Europe/Paris
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
### Cancer dependencies ###

WORKDIR /app
COPY package.json ./
# RUN apt-get update && \
#     apt-get install -y build-essential libcairo2 libcairo2-dev libpango1.0 \
#     libpango1.0-dev libjpeg-dev libgif7 libgif-dev librsvg2-2 librsvg2-dev && \
#     npm install
RUN apt-get update && \
    apt-get install -y software-properties-common build-essential pkg-config python3 && \
    npm install --production=true && \
    npm rebuild @tensorflow/tfjs-node --build-from-source

# See https://github.com/yhwang/node-red-contrib-tf-model#note (make TFJS works on Raspberry PI)
RUN if [ "$TARGETPLATFORM" = "linux/arm/v7" ] ; then \
    echo '{"tf-lib": "https://s3.us.cloud-object-storage.appdomain.cloud/tfjs-cos/libtensorflow-cpu-linux-arm-1.15.0.tar.gz"}' \
    > node_modules/@tensorflow/tfjs-node/scripts/custom-binary.json; fi

COPY . .

ENTRYPOINT [ "node", "troll.js" ]
CMD [ "-c", "default.json" ]
