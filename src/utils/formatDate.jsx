export function formatDate(date, format = "YYYY-MM-DD") {
    const d = new Date(date);
  
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
  
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
  
    return format
      .replace("YYYY", year)
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  }
  
  export function dateDiffInDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
  
    // Convert to UTC to avoid DST issues
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
    // Convert milliseconds to days
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }