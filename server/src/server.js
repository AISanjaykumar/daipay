import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/daipay';

(async () => {
  await mongoose.connect(MONGO_URL);
  app.listen(PORT, () => console.log(`DAIPay API running on :${PORT}`));
})();
