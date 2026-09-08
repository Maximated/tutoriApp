const path = require("node:path");
const fs = require("node:fs");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "tutoriapp.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  archived_at TEXT
)`);

// Debe reflejar la forma de blank() en js/app.js: el cliente completa los
// campos que falten al cargar, pero el curso inicial necesita ya la estructura base.
function blankState() {
  return {
    version: 2,
    profesor: { nombre: "" },
    grupos: [],
    alumnos: [],
    instrumentos: [],
    calificaciones: [],
    incidencias: [],
    notaObs: {},
    examenes: [],
    familias: {},
    entrevistas: [],
    agenda: [],
    partesLeidos: {},
    notasPrivadas: {},
    infoProfes: {},
    notasExamen: {},
    comedor: {},
    intereval: { "1": {}, "2": {}, "3": {} },
    pendientes: {},
  };
}

function currentAcademicYearLabel(d = new Date()) {
  const y = d.getFullYear();
  const startYear = d.getMonth() + 1 >= 8 ? y : y - 1; // el curso empieza en agosto/septiembre
  return `${startYear}-${startYear + 1}`;
}

function courseExists(id) {
  return !!db.prepare("SELECT 1 FROM courses WHERE id = ?").get(id);
}

function nextCourseId(prevId) {
  const m = /^(\d{4})-(\d{4})$/.exec(prevId || "");
  let start = m ? parseInt(m[2], 10) : new Date().getFullYear();
  let id = `${start}-${start + 1}`;
  let guard = 0;
  while (courseExists(id) && guard < 100) {
    start++;
    id = `${start}-${start + 1}`;
    guard++;
  }
  return id;
}

function rowToCourse(row, includeData) {
  return {
    id: row.id,
    label: row.label,
    status: row.status,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
    ...(includeData ? { data: JSON.parse(row.data) } : {}),
  };
}

function getActiveCourse() {
  const row = db.prepare("SELECT * FROM courses WHERE status = 'active' LIMIT 1").get();
  return row ? rowToCourse(row, true) : null;
}

function ensureActiveCourse() {
  const existing = getActiveCourse();
  if (existing) return existing;
  const id = currentAcademicYearLabel();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO courses (id, label, status, data, created_at) VALUES (?, ?, 'active', ?, ?)`
  ).run(id, `Curso ${id}`, JSON.stringify(blankState()), now);
  return getActiveCourse();
}

function saveActiveCourseData(data) {
  const active = ensureActiveCourse();
  db.prepare("UPDATE courses SET data = ? WHERE id = ?").run(JSON.stringify(data), active.id);
}

function listCourses() {
  const rows = db.prepare("SELECT * FROM courses ORDER BY created_at DESC").all();
  return rows.map((r) => rowToCourse(r, false));
}

function getCourseById(id) {
  const row = db.prepare("SELECT * FROM courses WHERE id = ?").get(id);
  return row ? rowToCourse(row, true) : null;
}

function archiveActiveCourse() {
  const active = ensureActiveCourse();
  const now = new Date().toISOString();
  db.prepare("UPDATE courses SET status = 'archived', archived_at = ? WHERE id = ?").run(now, active.id);
  const newId = nextCourseId(active.id);
  db.prepare(
    `INSERT INTO courses (id, label, status, data, created_at) VALUES (?, ?, 'active', ?, ?)`
  ).run(newId, `Curso ${newId}`, JSON.stringify(blankState()), now);
  return getActiveCourse();
}

module.exports = {
  ensureActiveCourse,
  saveActiveCourseData,
  listCourses,
  getCourseById,
  archiveActiveCourse,
};
