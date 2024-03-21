const mongoose = require('mongoose');


const uri ="mongodb://drenvio:moM5f3AodwLE5d0A@ac-aemgtkt-shard-00-00.unqyghm.mongodb.net:27017,ac-aemgtkt-shard-00-01.unqyghm.mongodb.net:27017,ac-aemgtkt-shard-00-02.unqyghm.mongodb.net:27017/ChallengeDavid?replicaSet=atlas-y8oxsk-shard-0&ssl=true&authSource=admin";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Esquema para el contador
const CounterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
});
const counter = mongoose.model('counter', CounterSchema);

// Esquema para el usuario
const userSchema = new mongoose.Schema({
  user_id: Number,
  correo: String,
  nombres: String,
  apellidos: String,
  password: String,
  newletter: Boolean,
});

// Middleware que incrementa el user_id antes de guardar
userSchema.pre('save', async function(next) {
  // Si el usuario es nuevo, incrementa el user_id
  if (this.isNew) {
    const count = await counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.user_id = count.seq;
  }

  next();
});

const Users = mongoose.model('users', userSchema);
module.exports = Users;