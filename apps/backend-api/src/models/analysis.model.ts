import { Schema, model, Model, Document, Types } from 'mongoose';
import { StockAnalysis, GroundingChunk } from '@ai-stock-analyser/shared';

export interface IAnalysisDocument extends Document {
  ticker: string;
  analysis: StockAnalysis;
  sources: GroundingChunk[];
  generatedAt: Date;
  expiresAt: Date;
  requestedBy: Types.ObjectId;
}

export interface IAnalysisModel extends Model<IAnalysisDocument> {
  findLatestByTicker(ticker: string): Promise<IAnalysisDocument | null>;
  findByTickerAndTimeRange(
    ticker: string,
    startDate: Date,
    endDate: Date
  ): Promise<IAnalysisDocument[]>;
}

const keyNewsSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { _id: false }
);

const historicalPricesSchema = new Schema(
  {
    yesterday: { type: String, required: true },
    week_ago: { type: String, required: true },
    month_ago: { type: String, required: true },
  },
  { _id: false }
);

const futurePredictionsSchema = new Schema(
  {
    tomorrow: { type: String, required: true },
    month_after: { type: String, required: true },
  },
  { _id: false }
);

const dailyStatsSchema = new Schema(
  {
    todaysOpen: { type: String, required: true },
    todaysHigh: { type: String, required: true },
  },
  { _id: false }
);

const stockAnalysisSchema = new Schema<StockAnalysis>(
  {
    ticker: { type: String, required: true },
    companyName: { type: String, required: true },
    currentPrice: { type: String, required: true },
    prediction: {
      type: String,
      enum: ['Bullish', 'Bearish', 'Neutral'],
      required: true,
    },
    recommendation: {
      type: String,
      enum: ['Buy', 'Sell', 'Hold'],
      required: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    analysisSummary: { type: String, required: true },
    keyNews: [keyNewsSchema],
    historicalPrices: { type: historicalPricesSchema, required: true },
    futurePredictions: { type: futurePredictionsSchema, required: true },
    dailyStats: { type: dailyStatsSchema, required: true },
  },
  { _id: false }
);

const groundingChunkSchema = new Schema<GroundingChunk>(
  {
    web: {
      uri: { type: String, required: true },
      title: { type: String, required: true },
    },
  },
  { _id: false }
);

const analysisSchema = new Schema<IAnalysisDocument, IAnalysisModel>(
  {
    ticker: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    analysis: {
      type: stockAnalysisSchema,
      required: true,
    },
    sources: {
      type: [groundingChunkSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
        // Convert Date objects to ISO strings
        ret.generatedAt = ret.generatedAt.toISOString();
        ret.expiresAt = ret.expiresAt.toISOString();
        ret.requestedBy = ret.requestedBy.toString();
        return ret;
      },
    },
  }
);

// TTL index on expiresAt for automatic cleanup
analysisSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient ticker + time range queries
analysisSchema.index({ ticker: 1, generatedAt: -1 });

// Static method: Find latest analysis by ticker
analysisSchema.statics.findLatestByTicker = async function (
  ticker: string
): Promise<IAnalysisDocument | null> {
  return this.findOne({ ticker: ticker.toUpperCase() })
    .sort({ generatedAt: -1 })
    .exec();
};

// Static method: Find analyses by ticker and time range
analysisSchema.statics.findByTickerAndTimeRange = async function (
  ticker: string,
  startDate: Date,
  endDate: Date
): Promise<IAnalysisDocument[]> {
  return this.find({
    ticker: ticker.toUpperCase(),
    generatedAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ generatedAt: -1 })
    .exec();
};

export const AnalysisModel = model<IAnalysisDocument, IAnalysisModel>(
  'Analysis',
  analysisSchema
);
