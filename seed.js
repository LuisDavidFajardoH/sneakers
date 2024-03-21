const mongoose = require('mongoose');
const faker = require('faker');
const Product = require('./Product');
const Users = require('./users');

mongoose.connect('mongodb://drenvio:moM5f3AodwLE5d0A@ac-aemgtkt-shard-00-00.unqyghm.mongodb.net:27017,ac-aemgtkt-shard-00-01.unqyghm.mongodb.net:27017,ac-aemgtkt-shard-00-02.unqyghm.mongodb.net:27017/ChallengeDavid?replicaSet=atlas-y8oxsk-shard-0&ssl=true&authSource=admin', { useNewUrlParser: true, useUnifiedTopology: true });

async function createFakeData() {
  for (let i = 0; i < 100; i++) {
    const product = new Product({
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      inStock: faker.datatype.boolean(),
      brand: faker.company.companyName(),
      imageUrl: faker.image.imageUrl()
    });

    await product.save();

    // const user = new Users({
    //   correo: faker.internet.email(),
    //   nombres: faker.name.firstName(),
    //   apellidos: faker.name.lastName(),
    //   password: faker.internet.password(),
    //   newletter: faker.datatype.boolean(),
    // });

    // await user.save();
  }

  console.log('Datos falsos creados!');
}

createFakeData().then(() => {
  mongoose.disconnect();
});
