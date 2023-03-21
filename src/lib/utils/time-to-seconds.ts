export const time_to_seconds = ({
  hours = 0,
  minutes = 0,
  seconds = 0,
}) => hours * 3600 + minutes * 60 + seconds
