FROM node:18

# Install Litestream
RUN curl -L https://github.com/benbjohnson/litestream/releases/latest/download/litestream-linux-amd64 \
  -o /usr/local/bin/litestream && chmod +x /usr/local/bin/litestream

WORKDIR /app

COPY . .

RUN npm install

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
