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

ENV DATABASE_URL=postgres://vtccontroldb_user:1ho6gEA93gSeCzkBrdy6TWOwVHL2jNGJ@dpg-cls80ajip8as739ocfvg-a.oregon-postgres.render.com/vtccontroldb
ENV PORT=8000
ENV SALT=10
ENV ROOT_EMAIL=kadjibecker@gmail.com
ENV ROOT_PHONE=+237696809088
ENV ROOT_PASSWORD=password
ENV ROOT_FIRST_NAME=root
ENV ROOT_LAST_NAME=admin
ENV CLOUDINARY_URL=CLOUDINARY_URL
ENV CLOUD_NAME=CLOUD_NAME
ENV CLOUDINARY_API_KEY=CLOUDINARY_API_KEY
ENV CLOUNDINARY_API_SECRET=CLOUNDINARY_API_SECRET
ENV CLOUDINARY_DIRECT_UPLOAD=CLOUDINARY_DIRECT_UPLOAD
ENV FRONT_URL=https://vtccontrol.com/
ENV LOGIN_TEMPLATE=5315161
ENV MAILJET_PUBLIC=8b4b99b8b8df8f34214a06eaf8c36e81
ENV MAILJET_PRIVATE=3b32a653ddd39b1418570c28c645fed3
ENV REGION='us-west-2'
ENV AWSACCESSKEYID='AKIAU2QOMM4QX2YT6HMX'
ENV AWSSECRETKEY='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'
ENV IMAGELOCATION='https://s3.us-west-2.amazonaws.com/images.vtccontrol.com/'
ENV SECRET_TOKEN='4quA3J9Pn4IxNTBk6aW4ns9EnDEt63XIDzErnexxU2xHtI6zHxToHGovbjdtmwkU'

RUN npm run tsoa

RUN npx prisma db push

RUN npm run seed


# Bundle app source
COPY . .

CMD [ "npm", "start"]
