const mongoose = require('mongoose');

const NovelaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  genero: { type: String, required: true },
  sinopsis: { type: String, required: true },
  estado: { type: String, enum: ['En curso', 'Completada', 'Abandonada'], default: 'En curso' },
  capitulos: { type: Number, default: 0 },
  imagen_portada: { type: String },
  etiquetas: [String],
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Novela', NovelaSchema);
