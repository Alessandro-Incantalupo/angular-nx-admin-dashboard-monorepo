# models

Types and Zod schemas shared by the Angular app and the API. A schema here is the only definition of what a valid member, login, password change or settings form is: the API validates request bodies with it, and the Angular forms run the same schema through Signal Forms' `validateStandardSchema`.

Keep this library free of Angular and Node imports: it runs in both.

```sh
pnpm nx test models
```
