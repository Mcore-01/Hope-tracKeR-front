export function useAuth() {
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Гость';
  const userId = localStorage.getItem('userId');
  const isAuth = !!token;

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
  };

  return { isAuth, userName, userId, logoutUser };
}