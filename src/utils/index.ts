export const formattedDate = (date: Date | string): string => {
  const d: Date = (() => {
    if (typeof date === "string") {
      return new Date(date);
    } else {
      return date;
    }
  })();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
