export const formatVnd = (amount: number): string =>
  new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
export const formatDateOnly = (date: string): string => {
  const [year, month, day] = date.split('-');
  return year && month && day ? day + '/' + month : date;
};
