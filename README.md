---
title: "REST Microservice"
author: "David A. Mancilla"
tags: ["nodejs","express", "mongodb", "mongoose", "apirest","swagger","openapi",
"problemdetails","http2","prometheus-metrics","logging","jwt","authentication",
"authorization","google-auth","roles","cloudinary","healthchecks","environments",
"cors","docker"]
---

# WebServer + RestServer #

[![Build Status](https://dev.azure.com/dmancilla/Node.js%20API%20REST/_apis/build/status/dmancilla85.node-rest-server?branchName=master)](https://dev.azure.com/dmancilla/Node.js%20API%20REST/_build/latest?definitionId=5&branchName=master)

Para definir el entorno de NODE
```
$env:NODE_ENV = 'development'
```

## BACKLOG
- [ ] Completa validation model (60%) | revisar esto para todos los endpoints

## TODO
- [ ] Agregar Métricas (50%) | falta agregar métricas personalizadas
- [ ] Agregar CircuitBreaker/Retry (25%) | requiere convertir en promesas las funciones de los controladores

## DONE
- [x] HealthChecks para Mongo
- [x] ProblemDetails
- [x] Swagger
- [x] Logging y persistir logs como archivos
- [x] HTTP/2. Falta que funcione Swagger con HTTP/2
- [x] Autenticación por token
- [x] CORS
- [x] Reparar getImages
- [x] HealthChecks general
- [x] Docker container
- [x] Rate Limiter
- [x] Upload files to Mongo
