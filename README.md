# Aula Pasteur · TutoriApp

Herramienta de gestión docente (grupos, alumnos, notas, incidencias, entrevistas...).

## Estructura

- `index.html`, `css/style.css`, `js/app.js` — frontend (sin build, JS vanilla).
- `server/` — API en Node/Express que persiste los datos en SQLite (`better-sqlite3`).
- `legacy/aula_115.html` — versión original de un solo fichero, guardada como referencia.

Los datos ya no se guardan en el navegador (`localStorage`): la app carga y
guarda el curso activo contra el servidor (`GET/PUT /api/course/active`).
Desde **Ajustes** se puede archivar el curso actual (crea un curso nuevo en
blanco y guarda el anterior) y consultarlo después en modo solo lectura desde
**Archivo**.

## Desarrollo local

```bash
npm install
npm start        # sirve en http://localhost:3000, datos en ./data/tutoriapp.db
```

## Despliegue con Docker Compose

Cada push a `main` construye la imagen y la publica en
`ghcr.io/maximated/tutoriapp:latest` (ver `.github/workflows/docker-publish.yml`).

En el servidor:

```bash
docker compose pull
docker compose up -d
```

Los datos persisten en el volumen `tutoriapp_data` (`/data/tutoriapp.db`
dentro del contenedor). Variables de entorno disponibles: `PORT` (por
defecto `3000`) y `DB_PATH` (por defecto `/data/tutoriapp.db`).

> Si el paquete de GHCR queda como privado, hay que iniciar sesión en el
> servidor con `docker login ghcr.io` (token con permiso `read:packages`) o
> marcar el paquete como público desde GitHub.
