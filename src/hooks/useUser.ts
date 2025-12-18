import { useEffect, useState, useCallback } from 'react';
import { auth } from '../config/firebase.config';
import { UserService } from '../services/database/user.service';
import { User } from '../types/database.types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await UserService.getUserById(currentUser.uid);
      if (error) {
        setError(error);
      } else {
        setUser(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
};