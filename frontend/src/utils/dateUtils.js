// Placeholder file for utility functions
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('cs-CZ');
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
};

export const getScoreDifference = (homeScore, awayScore) => {
  return Math.abs(homeScore - awayScore);
};
