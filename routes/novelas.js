const express = require('express');
const Novela = require('../models/Novela');
const router = express.Router();
const multer = require('multer');
const path = require('path');

/**
 * @swagger
 * components:
 *   schemas:
 *     Novela:
 *       type: object
 *       required:
 *         - titulo
 *         - autor
 *         - genero
 *         - sinopsis
 *       properties:
 *         titulo:
 *           type: string
 *           description: Título de la novela
 *         autor:
 *           type: string
 *           description: Autor de la novela
 *         genero:
 *           type: string
 *           description: Género de la novela
 *         sinopsis:
 *           type: string
 *           description: Resumen de la trama
 *         estado:
 *           type: string
 *           enum: [En curso, Completada, Abandonada]
 *           default: En curso
 *         capitulos:
 *           type: number
 *           default: 0
 *         imagen_portada:
 *           type: string
 *           description: URL de la imagen de portada
 *         etiquetas:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de etiquetas
 */

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen'));
  }
});

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.use(requireLogin);

/**
 * @swagger
 * /novelas:
 *   get:
 *     summary: Obtiene la lista de novelas
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Campo para ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Orden (asc/desc)
 *     responses:
 *       200:
 *         description: Lista de novelas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Novela'
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';
    const estado = req.query.estado || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order || 'desc';

    const query = { usuario: req.session.userId };
    if (search) {
      query.$or = [
        { titulo: { $regex: search, $options: 'i' } },
        { autor: { $regex: search, $options: 'i' } },
        { genero: { $regex: search, $options: 'i' } }
      ];
    }
    if (estado) query.estado = estado;

    const total = await Novela.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const novelas = await Novela.find(query)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render('novelas/index', {
      novelas,
      currentPage: page,
      totalPages,
      search,
      estado,
      sortBy,
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar las novelas');
  }
});

router.get('/new', (req, res) => res.render('novelas/create'));

/**
 * @swagger
 * /novelas:
 *   post:
 *     summary: Crea una nueva novela
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               autor:
 *                 type: string
 *               genero:
 *                 type: string
 *               sinopsis:
 *                 type: string
 *               estado:
 *                 type: string
 *               capitulos:
 *                 type: number
 *               imagen_portada:
 *                 type: string
 *                 format: binary
 *               etiquetas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Novela creada exitosamente
 *       500:
 *         description: Error al crear la novela
 */
router.post('/', upload.single('imagen_portada'), async (req, res) => {
  try {
    const novelaData = { ...req.body, usuario: req.session.userId };
    
    // Procesar etiquetas si existen
    if (novelaData.etiquetas) {
      novelaData.etiquetas = novelaData.etiquetas
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // Asegurar que capitulos sea un número
    novelaData.capitulos = parseInt(novelaData.capitulos) || 0;

    // Agregar la ruta de la imagen si se subió una
    if (req.file) {
      novelaData.imagen_portada = '/uploads/' + req.file.filename;
    }

    await Novela.create(novelaData);
    res.redirect('/novelas');
  } catch (error) {
    console.error('Error al crear la novela:', error);
    res.status(500).send('Error al crear la novela');
  }
});

router.get('/:id/edit', async (req, res) => {
  const novela = await Novela.findById(req.params.id);
  res.render('novelas/edit', { novela });
});

router.post('/:id', upload.single('imagen_portada'), async (req, res) => {
  try {
    const novelaData = { ...req.body };
    
    // Procesar etiquetas si existen
    if (novelaData.etiquetas) {
      novelaData.etiquetas = novelaData.etiquetas
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // Asegurar que capitulos sea un número
    novelaData.capitulos = parseInt(novelaData.capitulos) || 0;

    // Agregar la ruta de la imagen solo si se subió una nueva
    if (req.file) {
      novelaData.imagen_portada = '/uploads/' + req.file.filename;
    }

    await Novela.findByIdAndUpdate(req.params.id, novelaData);
    res.redirect('/novelas');
  } catch (error) {
    console.error('Error al actualizar la novela:', error);
    res.status(500).send('Error al actualizar la novela');
  }
});

router.post('/:id/delete', async (req, res) => {
  await Novela.findByIdAndDelete(req.params.id);
  res.redirect('/novelas');
});

module.exports = router;
