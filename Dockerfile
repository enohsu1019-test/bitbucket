FROM harbor.metaage.tech/base/web-server:20200218-1058
# FROM harbor.sysage.com.tw/base/web-server:20200218-1058
WORKDIR /usr/www/server

COPY dist/cmpweb/ ./website/

EXPOSE 80

CMD ["node", "index"];
