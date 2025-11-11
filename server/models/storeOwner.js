const mongoose = require("mongoose");

// Use bcryptjs consistently across routes and model
const bcrypt = require("bcryptjs");

const storeOwnerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    // Consider adding minlength here if desired
    // minlength: [6, 'Password must be at least 6 characters long']
  },
  store: {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    products: [
      {
        name: String,
        price: Number,
        description: String,
        image: String,
      },
    ],
  },
  // Consider adding a createdAt field
  // createdAt: { type: Date, default: Date.now }
});

// --- Add the pre-save hook here ---
// Hash password before saving
storeOwnerSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  // If the password already looks like a bcrypt hash (registration route pre-hashed it), skip re-hashing
  // Bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost and salt marker
  if (/^\$2[aby]\$\d{2}\$/.test(this.password)) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
storeOwnerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
// --- End of added code ---

const StoreOwner = mongoose.model("StoreOwner", storeOwnerSchema);
module.exports = StoreOwner;

// module.exports = mongoose.model("StoreOwner", storeOwnerSchema);
