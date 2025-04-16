const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MatchSchema = new Schema({
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  homeTeam: {
    type: String,
    required: true
  },
  awayTeam: {
    type: String,
    required: true
  },
  homeTeamFlag: {
    type: String,
    required: true
  },
  awayTeamFlag: {
    type: String,
    required: true
  },
  stage: {
    type: String,
    required: true,
    enum: ['group', 'quarterfinal', 'semifinal', 'bronze', 'final']
  },
  group: {
    type: String,
    required: function() { return this.stage === 'group'; }
  },
  startTime: {
    type: Date,
    required: true
  },
  result: {
    homeScore: {
      type: Number,
      default: null
    },
    awayScore: {
      type: Number,
      default: null
    },
    endingType: {
      type: String,
      enum: ['regular', 'overtime', 'shootout', null],
      default: null
    },
    isFinished: {
      type: Boolean,
      default: false
    }
  },
  apiUpdatedAt: {
    type: Date,
    default: null
  },
  manuallyUpdated: {
    type: Boolean,
    default: false
  },
  manuallyUpdatedAt: {
    type: Date,
    default: null
  },
  manuallyUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

module.exports = mongoose.model('Match', MatchSchema);
