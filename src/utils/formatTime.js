const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toTimeString().split(' ')[0]; // Gets "hh:mm:ss"
};

export default formatTime;
