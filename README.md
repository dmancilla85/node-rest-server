---
title: "NODE REST Microservice Example"
tags: ["nodejs","express", "mongodb", "apirest","swagger","openapi","problemdetails",
"http2","prometheus-metrics","logging","jwt","authentication","authorization",
"google-auth","roles","cloudinary","healthchecks"]
---

# WebServer + RestServer #

Recuerden que deben ejecutar `npm install` para reconstruir los módulos de node

Para definir el entorno de NODE
```
$env:NODE_ENV = 'development'
```

## TODO
- Agregar Métricas (50%) | falta agregar métricas personalizadas
- Agregar HealthChecks para Mongo
- Agregar CircuitBreaker/Retry
- Completa validation model (60%) | revisar esto para todos los endpoints
- Middleware para ProblemDetails (?)

## DONE
- Agregar ProblemDetails
- Agregar Swagger
- Agregar Logging y persistir logs como archivos
- Agregar HTTP/2. Falta que funcione Swagger con HTTP/2
- Agregar autenticación por token
- Reparar getImages
- HealthChecks general
