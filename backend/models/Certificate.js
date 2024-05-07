import mongoose from "mongoose";

const { Schema } = mongoose;

const CertificateSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("certificate", CertificateSchema);
