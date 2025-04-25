const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;

app.use(express.json());

// Data penjualan disimpan dalam array
let penjualan = [];
let idCounter = 1;

// Middleware autentikasi sederhana
const authenticate = (req, res, next) => {
  const token = req.headers['kode'];

  if (!token || token !== 'ith') {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak valid.' });
  }

  next();
};

// Validasi dan sanitasi untuk POST & PUT
const validatePenjualan = [
  body('namaPembeli')
    .trim()
    .escape()
    .notEmpty().withMessage('Nama pembeli wajib diisi'),

  body('namaBarang')
    .trim()
    .escape()
    .notEmpty().withMessage('Nama barang wajib diisi'),

  body('tanggalTransaksi')
    .trim() 
    .notEmpty().withMessage('Tanggal transaksi wajib diisi')
    .isISO8601().withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
];

// GET semua data penjualan
app.get('/penjualan', authenticate, (req, res) => {
  if (penjualan.length === 0) {
    return res.status(200).json({ message: 'Tidak ada data penjualan' });
  }
  res.json(penjualan);
});

// POST data penjualan baru
app.post('/penjualan', authenticate, validatePenjualan, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { namaPembeli, namaBarang, tanggalTransaksi } = req.body;
  const newData = {
    id: idCounter++,
    namaPembeli,
    namaBarang,
    tanggalTransaksi
  };

  penjualan.push(newData);
  res.status(201).json(newData);
});

// PUT ubah seluruh data penjualan berdasarkan ID
app.put('/penjualan/:id', authenticate, validatePenjualan, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = parseInt(req.params.id);
  const { namaPembeli, namaBarang, tanggalTransaksi } = req.body;

  const index = penjualan.findIndex((data) => data.id === id);
  if (index !== -1) {
    penjualan[index] = { id, namaPembeli, namaBarang, tanggalTransaksi };
    res.json(penjualan[index]);
  } else {
    res.status(404).json({ message: 'Data penjualan tidak ditemukan' });
  }
});

// PATCH ubah sebagian data penjualan
app.patch('/penjualan/:id', authenticate, [
  body('namaPembeli')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage('Nama pembeli tidak boleh kosong'),

  body('namaBarang')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage('Nama barang tidak boleh kosong'),

  body('tanggalTransaksi')
    .optional()
    .trim()
    .isISO8601().withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const id = parseInt(req.params.id);
  const { namaPembeli, namaBarang, tanggalTransaksi } = req.body;

  const index = penjualan.findIndex((data) => data.id === id);
  if (index !== -1) {
    if (namaPembeli) penjualan[index].namaPembeli = namaPembeli;
    if (namaBarang) penjualan[index].namaBarang = namaBarang;
    if (tanggalTransaksi) penjualan[index].tanggalTransaksi = tanggalTransaksi;
    res.json(penjualan[index]);
  } else {
    res.status(404).json({ message: 'Data penjualan tidak ditemukan' });
  }
});

// DELETE hapus data penjualan
app.delete('/penjualan/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = penjualan.findIndex((data) => data.id === id);

  if (index !== -1) {
    penjualan.splice(index, 1);
    res.json({ message: 'Data penjualan berhasil dihapus' });
  } else {
    res.status(404).json({ message: 'Data penjualan tidak ditemukan' });
  }
});

// DELETE semua data penjualan dan reset ID
app.delete('/penjualan', authenticate, (req, res) => {
  penjualan = [];
  idCounter = 1; // Reset ID supaya mulai dari 1 lagi
  res.json({ message: 'Semua data penjualan telah dihapus ' });
});


// Jalankan server
app.listen(port, () => {    
})
