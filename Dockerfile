# use build image to optimize storage
FROM node:14-alpine as BUILD_IMAGE
WORKDIR /app

# restore pagackage first for better caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# build app
COPY . .
RUN yarn build 

# remove dev packages
RUN npm prune --production

# copy to production image
FROM node:14-alpine
WORKDIR /app

# make a dedicated node user for security
RUN chown -R node:node /app
USER node

# copy from build image
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/dist ./dist

# run app
EXPOSE 3000
CMD node dist/server.js
