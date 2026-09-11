import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend de SaS Vaikuntha corriendo en http://localhost:${PORT}`);
});

export default app;
