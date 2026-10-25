const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors()); // Izinkan akses dari frontend
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Terhubung ke MongoDB!");
    
    const db = client.db('perbanas_marketplace');
    // PASTIKAN NAMA COLLECTION DI COMPASS ADALAH 'products' (pakai s)
    const productsCollection = db.collection('products'); 
    const usersCollection = db.collection('users');

    // Endpoint untuk mengambil produk
    app.get('/api/products', async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();
        
        // Ubah _id bawaan MongoDB menjadi id biasa agar dibaca frontend
        const formattedProducts = products.map(p => ({
          ...p,
          id: p._id.toString() 
        }));
        
        res.json(formattedProducts);
      } catch (err) {
        console.log("Error ambil data:", err);
        res.status(500).json({ error: "Gagal ambil data" });
      }
    });

    // ENDPOINT UNTUK SIMPAN USER (LOGIN/REGISTER OTOMATIS)
    app.post('/api/login', async (req, res) => {
      try {
        const { nama, nim, email, password, loginMode } = req.body;

        // Cek apakah user sudah ada di database
        let query = loginMode === 'nim' ? { nim: nim } : { email: email };
        let existingUser = await usersCollection.findOne(query);

        if (existingUser) {
          // Jika sudah ada, anggap login sukses (update nama jika berubah)
          await usersCollection.updateOne(query, { $set: { nama: nama } });
          return res.status(200).json({ message: "Login berhasil", user: existingUser });
        } else {
          // Jika belum ada, simpan sebagai user baru ke MongoDB
          const newUser = { 
            nama, 
            nim: loginMode === 'nim' ? nim : null, 
            email: loginMode === 'email' ? email : null, 
            password, 
            loginMode, 
            createdAt: new Date() 
          };
          await usersCollection.insertOne(newUser);
          return res.status(201).json({ message: "User baru berhasil didaftarkan", user: newUser });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan di server" });
      }
    });

    // Jalankan server
    app.listen(3000, () => {
      console.log("🚀 Server berjalan di http://localhost:3000");
    });

  } catch (err) {
    console.error("❌ Gagal konek ke MongoDB:", err);
  }
}

run();