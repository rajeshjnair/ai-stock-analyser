import { Schema, model, Model, Document, Types } from 'mongoose';

export enum UsageEventType {
  ANALYSIS_REQUEST = 'analysis_request',
  WATCHLIST_ADD = 'watchlist_add',
  WATCHLIST_REMOVE = 'watchlist_remove',
  ALERT_CREATED = 'alert_created',
  ALERT_TRIGGERED = 'alert_triggered',
  API_CALL = 'api_call',
  WEBSOCKET_CONNECT = 'websocket_connect',
  WEBSOCKET_DISCONNECT = 'websocket_disconnect',
}

export interface IUsageDocument extends Document {
  userId: Types.ObjectId;
  eventType: UsageEventType;
  ticker?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface UserUsageStats {
  userId: string;
  totalEvents: number;
  eventsByType: Record<UsageEventType, number>;
  period: {
    start: Date;
    end: Date;
  };
}

export interface IUsageModel extends Model<IUsageDocument> {
  logEvent(
    userId: string | Types.ObjectId,
    eventType: UsageEventType,
    ticker?: string,
    metadata?: Record<string, any>
  ): Promise<IUsageDocument>;
  getUserStats(
    userId: string | Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<UserUsageStats>;
  getEventsByType(
    eventType: UsageEventType,
    startDate?: Date,
    endDate?: Date
  ): Promise<IUsageDocument[]>;
}

const usageSchema = new Schema<IUsageDocument, IUsageModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: Object.values(UsageEventType),
      required: true,
      index: true,
    },
    ticker: {
      type: String,
      uppercase: true,
      trim: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        ret.userId = ret.userId.toString();
        ret.timestamp = ret.timestamp.toISOString();
        return ret;
      },
    },
  }
);

// Compound indexes for efficient querying
usageSchema.index({ userId: 1, timestamp: -1 });
usageSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
usageSchema.index({ eventType: 1, timestamp: -1 });
usageSchema.index({ ticker: 1, timestamp: -1 });

// Static method: Log a usage event
usageSchema.statics.logEvent = async function (
  userId: string | Types.ObjectId,
  eventType: UsageEventType,
  ticker?: string,
  metadata?: Record<string, any>
): Promise<IUsageDocument> {
  const event = new this({
    userId: typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
    eventType,
    ticker,
    metadata: metadata || {},
    timestamp: new Date(),
  });

  return event.save();
};

// Static method: Get user statistics for a time period
usageSchema.statics.getUserStats = async function (
  userId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<UserUsageStats> {
  const objectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

  const events = await this.find({
    userId: objectId,
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  }).exec();

  const eventsByType: Record<UsageEventType, number> = Object.values(UsageEventType).reduce(
    (acc, type) => {
      acc[type] = 0;
      return acc;
    },
    {} as Record<UsageEventType, number>
  );

  events.forEach((event) => {
    eventsByType[event.eventType]++;
  });

  return {
    userId: objectId.toString(),
    totalEvents: events.length,
    eventsByType,
    period: {
      start: startDate,
      end: endDate,
    },
  };
};

// Static method: Get events by type
usageSchema.statics.getEventsByType = async function (
  eventType: UsageEventType,
  startDate?: Date,
  endDate?: Date
): Promise<IUsageDocument[]> {
  const query: any = { eventType };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = startDate;
    }
    if (endDate) {
      query.timestamp.$lte = endDate;
    }
  }

  return this.find(query).sort({ timestamp: -1 }).exec();
};

export const UsageModel = model<IUsageDocument, IUsageModel>('Usage', usageSchema);
