require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const app = express();
const cors = require('cors');

app.use(cors());

app.use(express.json());

app.use(express.static(__dirname));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/pedido", async (req, res) => {
  const { pedidos, observacoes, mesa } = req.body;

  if (!mesa) return res.status(400).json({ error: "Mesa não informada" });

  try {
    for (const pedido of pedidos) {
      await pool.query(
        "INSERT INTO pedidos (item, quantidade, observacoes, mesa) VALUES ($1, $2, $3, $4)",
        [pedido.item, pedido.quantidade, observacoes, mesa]
      );
    }
    res.status(200).json({ message: "Pedido salvo com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    res.status(500).json({ error: "Erro ao salvar pedido" });
  }
});

app.delete("/pedido/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM pedidos WHERE id = $1", [id]);
    res.status(200).json({ message: "Pedido removido" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover pedido" });
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pedidos ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));