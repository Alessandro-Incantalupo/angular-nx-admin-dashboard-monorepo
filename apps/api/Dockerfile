# Runtime image for the API. The bundle is built before `docker build`
# (`pnpm nx build api` writes dist/apps/api/main.mjs, dependencies included),
# so the image holds Node and one file.
#   docker build -f apps/api/Dockerfile -t admin-api .
FROM node:26-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --chown=node:node dist/apps/api/main.mjs ./main.mjs
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "main.mjs"]
