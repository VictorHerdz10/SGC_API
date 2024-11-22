import mongoose from 'mongoose';

const BackupSchema = new mongoose.Schema({
  fechacreado: {
    type: Date,
    default: Date.now
  },
  size: {
    type: String,
    required: true
  },
  dropboxPath: {
    type: String,
    required: true
  }
});

// Indexes
BackupSchema.index({ dropboxPath: 1 });

const Backup = mongoose.model('Backup', BackupSchema);

export default Backup;