FROM starefossen/ruby-node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN yarn
RUN npm rebuild node-sass
RUN yarn docs:dev
RUN yarn build

EXPOSE 8080

ENTRYPOINT yarn start
