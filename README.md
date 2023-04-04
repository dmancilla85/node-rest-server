---
title: "REST Microservice"
author: "David A. Mancilla"
tags: ["nodejs","express", "mongodb", "mongoose", "apirest","swagger","openapi",
"problemdetails","http2","prometheus-metrics","logging","jwt","authentication",
"authorization","google-auth","roles","cloudinary","healthchecks","environments",
"cors","docker"]
---

# WebServer + RestServer #

Recuerden que deben ejecutar `npm install` para reconstruir los módulos de node

Para definir el entorno de NODE
```
$env:NODE_ENV = 'development'
```

## BACKLOG
- [ ] Middleware para ProblemDetails (?)
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
