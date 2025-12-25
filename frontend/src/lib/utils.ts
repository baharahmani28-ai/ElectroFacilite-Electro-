import Cookies from 'js-cookie';

export const getToken = (): string | undefined => {
  return Cookies.get('token');
};

export const setToken = (token: string): void => {
  Cookies.set('token', token, { expires: 7 });
};

export const removeToken = (): void => {
  Cookies.remove('token');
};

export const getUser = (): any => {
  const user = Cookies.get('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: any): void => {
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
};

export const removeUser = (): void => {
  Cookies.remove('user');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'under_review':
      return 'Under Review';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};
