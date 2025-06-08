// app.js
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Required to handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Path to JSON file
const dataPath = path.join(__dirname, "file", "post.json");

// Utility to read posts from JSON file
function readPosts() {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data) || [];
  } catch (err) {
    return [];
  }
}

// Utility to save posts to JSON file
function savePosts(posts) {
  fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));
}

// Custom ID generator
function generateId() {
  return "spidey_" + Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// Routes
app.get("/", (req, res) => {
  const posts = readPosts();
  res.render("home", { posts });
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", (req, res) => {
  const posts = readPosts();
  const newPost = {
    id: generateId(),
    title: req.body.title,
    content: req.body.content,
  };
  posts.push(newPost);
  savePosts(posts);
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const posts = readPosts();
  const post = posts.find(p => p.id === req.params.id);
  res.render("edit", { post });
});

app.post("/edit/:id", (req, res) => {
  let posts = readPosts();
  posts = posts.map(p =>
    p.id === req.params.id
      ? { ...p, title: req.body.title, content: req.body.content }
      : p
  );
  savePosts(posts);
  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  let posts = readPosts();
  posts = posts.filter(p => p.id !== req.params.id);
  savePosts(posts);
  res.redirect("/");
});

// Start server
app.listen(PORT, () => {
  console.log(`🕸️ Spidey Blog running at http://localhost:${PORT}`);
});
