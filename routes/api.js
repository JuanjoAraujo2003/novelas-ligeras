const express = require('express');
const router = express.Router();
const Novela = require('../models/Novela');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: X-API-Key
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         novelas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Novela'
 *         total:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         currentPage:
 *           type: integer
 */

/**
 * @swagger
 * /api/novelas:
 *   get:
 *     summary: Obtiene la lista de novelas
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtro por estado
 *     responses:
 *       200:
 *         description: Lista de novelas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: API Key no válida
 */

// Middleware para verificar API key
const verificarApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  console.log('API Key recibida:', apiKey);
  console.log('API Key esperada:', process.env.API_KEY);
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'API Key no válida' });
  }
  next();
};

// Aplicar middleware de verificación a todas las rutas
router.use(verificarApiKey);

// GET /api/novelas - Obtener todas las novelas
router.get('/novelas', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, estado, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { titulo: { $regex: search, $options: 'i' } },
        { autor: { $regex: search, $options: 'i' } },
        { genero: { $regex: search, $options: 'i' } }
      ];
    }
    if (estado) query.estado = estado;

    const total = await Novela.countDocuments(query);
    const novelas = await Novela.find(query)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      novelas,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las novelas' });
  }
});

// GET /api/novelas/:id - Obtener una novela específica
router.get('/novelas/:id', async (req, res) => {
  try {
    const novela = await Novela.findById(req.params.id);
    if (!novela) {
      return res.status(404).json({ error: 'Novela no encontrada' });
    }
    res.json(novela);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la novela' });
  }
});

// POST /api/novelas - Crear una nueva novela
router.post('/novelas', async (req, res) => {
  try {
    const novela = new Novela(req.body);
    await novela.save();
    res.status(201).json(novela);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear la novela' });
  }
});

// PUT /api/novelas/:id - Actualizar una novela
router.put('/novelas/:id', async (req, res) => {
  try {
    const novela = await Novela.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!novela) {
      return res.status(404).json({ error: 'Novela no encontrada' });
    }
    res.json(novela);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la novela' });
  }
});

// DELETE /api/novelas/:id - Eliminar una novela
router.delete('/novelas/:id', async (req, res) => {
  try {
    const novela = await Novela.findByIdAndDelete(req.params.id);
    if (!novela) {
      return res.status(404).json({ error: 'Novela no encontrada' });
    }
    res.json({ mensaje: 'Novela eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la novela' });
  }
});

module.exports = router;