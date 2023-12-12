FROM node:18
  
# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./package.json ./

RUN npm install

COPY ./ ./

RUN mkdir -p /app/logs

# If you are building your code for production
# RUN npm ci --only=production

RUN npm run tsoa

RUN npx prisma db push

RUN npm run seed


# Bundle app source
COPY . .

CMD [ "npm", "start"]
