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
## TODO
- [ ] Completa validation model (60%) | revisar esto para todos los endpoints
- [ ] Agregar Métricas: falta agregar métricas personalizadas
- [ ] Completar implementación de CircuitBreaker.
- [ ] Agregar ejemplo de pruebas unitarias

## DONE
- HealthChecks para Mongo
- ProblemDetails
- Swagger
- Logging y persistir logs como archivos
- HTTP/2. Falta que funcione Swagger con HTTP/2
- Autenticación por token JWT y Google
- CORS
- Dockerfile
- Rate Limiter
- Upload files to GridFS
