const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeagueSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    displayName: {
      type: String,
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  }],
  scoringRules: {
    exactScore: { type: Number, default: 5 },
    correctWinner: { type: Number, default: 2 },
    correctScoreDifference: { type: Number, default: 3 },
    correctHomeGoals: { type: Number, default: 1 },
    correctAwayGoals: { type: Number, default: 1 },
    correctEndingType: { type: Number, default: 1 }
  }
});

module.exports = mongoose.model('League', LeagueSchema);
