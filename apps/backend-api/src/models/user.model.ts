import { Schema, model, Model, Document } from 'mongoose';
import { User, UserTier, UserSettings, UserSubscription } from '@ai-stock-analyser/shared';

export interface IUserDocument extends Omit<User, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUserDocument> {
  findByFirebaseUid(firebaseUid: string): Promise<IUserDocument | null>;
  updateWatchlist(
    userId: string,
    action: 'add' | 'remove' | 'replace',
    symbols: string[]
  ): Promise<IUserDocument | null>;
}

const userSettingsSchema = new Schema<UserSettings>(
  {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      priceAlerts: { type: Boolean, default: true },
      newsAlerts: { type: Boolean, default: true },
    },
    preferences: {
      defaultView: { type: String, enum: ['grid', 'list'], default: 'grid' },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      currency: { type: String, default: 'USD' },
      timezone: { type: String, default: 'UTC' },
    },
    privacy: {
      shareWatchlist: { type: Boolean, default: false },
      shareActivity: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const userSubscriptionSchema = new Schema<UserSubscription>(
  {
    id: { type: String, required: true },
    tier: {
      type: String,
      enum: Object.values(UserTier),
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'expired'],
      required: true
    },
    currentPeriodStart: { type: Number, required: true },
    currentPeriodEnd: { type: Number, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
    tier: {
      type: String,
      enum: Object.values(UserTier),
      default: UserTier.FREE,
      required: true,
    },
    watchlist: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr: string[]) {
          return arr.length <= 10;
        },
        message: 'Watchlist cannot exceed 10 symbols',
      },
    },
    settings: {
      type: userSettingsSchema,
      default: () => ({}),
    },
    subscription: {
      type: userSubscriptionSchema,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        // Convert Date objects to Unix timestamps (milliseconds)
        ret.createdAt = ret.createdAt.getTime();
        ret.updatedAt = ret.updatedAt.getTime();
        return ret;
      },
    },
  }
);

// Pre-save middleware for updatedAt
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Static method: Find user by Firebase UID
userSchema.statics.findByFirebaseUid = async function (
  firebaseUid: string
): Promise<IUserDocument | null> {
  return this.findOne({ firebaseUid });
};

// Static method: Update watchlist
userSchema.statics.updateWatchlist = async function (
  userId: string,
  action: 'add' | 'remove' | 'replace',
  symbols: string[]
): Promise<IUserDocument | null> {
  const user = await this.findById(userId);

  if (!user) {
    return null;
  }

  switch (action) {
    case 'add':
      // Add symbols that don't already exist
      const newSymbols = symbols.filter(symbol => !user.watchlist.includes(symbol));
      user.watchlist.push(...newSymbols);
      // Enforce max 10 limit
      if (user.watchlist.length > 10) {
        user.watchlist = user.watchlist.slice(0, 10);
      }
      break;

    case 'remove':
      user.watchlist = user.watchlist.filter(symbol => !symbols.includes(symbol));
      break;

    case 'replace':
      user.watchlist = symbols.slice(0, 10); // Enforce max 10 limit
      break;
  }

  return user.save();
};

export const UserModel = model<IUserDocument, IUserModel>('User', userSchema);
