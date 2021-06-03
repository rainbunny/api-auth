# auth-api

Api of auth service.

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
![Eslint](https://badgen.net/badge/eslint/airbnb/ff5a5f?icon=airbnb)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
![GitHub](https://img.shields.io/github/license/thinhtran3588/auth-api)
![GitHub repo size](https://img.shields.io/github/repo-size/thinhtran3588/auth-api)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/thinhtran3588/auth-api)

**main:**
![CI-main](https://github.com/thinhtran3588/auth-api/workflows/CI-main/badge.svg)
[![codecov](https://codecov.io/gh/thinhtran3588/auth-api/branch/main/graph/badge.svg)](https://codecov.io/gh/thinhtran3588/auth-api)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_auth-api&metric=alert_status)](https://sonarcloud.io/dashboard?id=thinhtran3588_auth-api)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_auth-api&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_auth-api)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_auth-api&metric=security_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_auth-api)

**develop:**
![CI-develop](https://github.com/thinhtran3588/auth-api/workflows/CI-develop/badge.svg?branch=develop)
[![codecov](https://codecov.io/gh/thinhtran3588/auth-api/branch/develop/graph/badge.svg)](https://codecov.io/gh/thinhtran3588/auth-api/branch/develop)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_auth-api&branch=develop&metric=alert_status)](https://sonarcloud.io/dashboard?id=thinhtran3588_auth-api&branch=develop)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_auth-api&branch=develop&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_auth-api&branch=develop)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=thinhtran3588_auth-api&branch=develop&metric=security_rating)](https://sonarcloud.io/dashboard?id=thinhtran3588_auth-api&branch=develop)

## How to install

1. Restore packages

   ```bash
   yarn

   ```

2. Put `prod.env` into `environments/prod`. Or you may use another env file for another environment.

3. Update environment

   ```bash
   yarn execute change-env prod
   ```

4. Migrate database

   ```bash
   yarn pg-migrate up
   ```

5. Initialize app, create `admin` user

   ```bash
   yarn execute initialize-app
   ```
