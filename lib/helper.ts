export const formateIndDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

// Convert "09:30" to 570
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert 570 back to "09:30" for the UI
export const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert 870 to "02:30 PM" (Use this for displaying text to users)
export const minutesToAmPm = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes === null) return "12:00 AM";

  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  // Determine AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};


export const formatMemberId = (memberId: number | null) => {
    if (!memberId) return 'N/A';
    return `MID${String(memberId).padStart(4, '0')}`;
};