import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Batch from '../models/Batch.js';
import Transaction from '../models/Transaction.js';
import ChatMessage from '../models/ChatMessage.js';
import { users, medicines, batches, transactions } from './data.js';

dotenv.config();

async function seed() {
  await connectDB();

  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Medicine.deleteMany({}),
    Batch.deleteMany({}),
    Transaction.deleteMany({}),
    ChatMessage.deleteMany({}),
  ]);

  console.log('Seeding users...');
  for (const userData of users) {
    await User.create(userData);
  }

  console.log('Seeding medicines...');
  const medicineIdMap = new Map();
  for (const { _mockId, ...medData } of medicines) {
    const medicine = await Medicine.create(medData);
    medicineIdMap.set(_mockId, medicine._id);
  }

  console.log('Seeding batches...');
  const batchNumberMap = new Map();
  for (const batchData of batches) {
    const medicineId = medicineIdMap.get(batchData.medicineId);
    const batch = await Batch.create({ ...batchData, medicineId });
    batchNumberMap.set(batch.batchNumber, batch._id);
  }

  console.log('Seeding transactions...');
  for (const txnData of transactions) {
    const medicineId = medicineIdMap.get(txnData.medicineId);
    const batchDbId = batchNumberMap.get(txnData.batchId);
    await Transaction.create({
      ...txnData,
      medicineId,
      ...(batchDbId ? { batchDbId } : {}),
    });
  }

  console.log('Seed complete.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
