const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PredictionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leagueId: {
    type: Schema.Types.ObjectId,
    ref: 'League',
    required: true
  },
  matchId: {
    type: Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  homeScore: {
    type: Number,
    required: true
  },
  awayScore: {
    type: Number,
    required: true
  },
  endingType: {
    type: String,
    enum: ['regular', 'overtime', 'shootout'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    default: 0
  },
  evaluated: {
    type: Boolean,
    default: false
  },
  evaluationDetails: {
    exactScore: { type: Boolean, default: false },
    correctWinner: { type: Boolean, default: false },
    correctScoreDifference: { type: Boolean, default: false },
    correctHomeGoals: { type: Boolean, default: false },
    correctAwayGoals: { type: Boolean, default: false },
    correctEndingType: { type: Boolean, default: false }
  }
});

// Compound index to ensure a user can only have one prediction per match per league
PredictionSchema.index({ userId: 1, matchId: 1, leagueId: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', PredictionSchema);
