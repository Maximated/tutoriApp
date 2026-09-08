const path = require("node:path");
const express = require("express");
const db = require("./db");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json({ limit: "15mb" }));

app.get("/api/course/active", (req, res) => {
  res.json(db.ensureActiveCourse());
});

app.put("/api/course/active", (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "invalid body" });
  }
  db.saveActiveCourseData(req.body);
  res.json({ ok: true });
});

app.get("/api/courses", (req, res) => {
  res.json(db.listCourses());
});

app.get("/api/courses/:id", (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: "not found" });
  res.json(course);
});

app.post("/api/courses/archive", (req, res) => {
  res.json(db.archiveActiveCourse());
});

app.use(express.static(path.join(__dirname, "..")));

app.listen(PORT, () => {
  console.log(`TutoriApp escuchando en el puerto ${PORT}`);
});
