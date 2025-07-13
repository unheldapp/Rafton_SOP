import { useData } from '../context/DataContext';
import { User, UserRole } from '../types';

export function useUsers() {
  const { users, isLoading, error } = useData();

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUserByEmail = (email: string): User | undefined => {
    return users.find(user => user.email === email);
  };

  const getUsersByRole = (role: UserRole): User[] => {
    return users.filter(user => user.role === role);
  };

  const getUsersByDepartment = (department: string): User[] => {
    return users.filter(user => user.department === department);
  };

  const getActiveUsers = (): User[] => {
    return users.filter(user => user.status === 'active');
  };

  const getPendingUsers = (): User[] => {
    return users.filter(user => user.status === 'pending');
  };

  const getAdmins = (): User[] => {
    return getUsersByRole('admin');
  };

  const getEmployees = (): User[] => {
    return getUsersByRole('employee');
  };

  const getAuditors = (): User[] => {
    return getUsersByRole('auditor');
  };

  const getDepartments = (): string[] => {
    const departments = users
      .map(user => user.department)
      .filter((dept): dept is string => Boolean(dept))
      .filter((dept, index, arr) => arr.indexOf(dept) === index);
    return departments.sort();
  };

  return {
    users,
    isLoading,
    error,
    getUserById,
    getUserByEmail,
    getUsersByRole,
    getUsersByDepartment,
    getActiveUsers,
    getPendingUsers,
    getAdmins,
    getEmployees,
    getAuditors,
    getDepartments
  };
} 