FROM node:19-alpine

ARG BASE_DIR=/opt/demo-app
RUN mkdir $BASE_DIR

# All other files are ignored by default via .dockerignore to avoid unnecessarily inflating the Docker context
# Files and directories are ordered by how frequently they change to maximize the use of Docker cache
COPY .eslintrc.json $BASE_DIR
COPY tsconfig.json $BASE_DIR
COPY webpack.config.js $BASE_DIR
COPY .env $BASE_DIR
COPY public $BASE_DIR/public
COPY yarn.lock $BASE_DIR
COPY package.json $BASE_DIR

WORKDIR $BASE_DIR
# Install project dependencies
RUN yarn

# Expose port 3000 to make the app accessible via the host machine's browser
EXPOSE 3000

# Start the demo app
CMD yarn start
