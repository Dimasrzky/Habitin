import { useEffect, useState } from 'react';
import { auth } from '../config/firebase.config';
import { UserService } from '../services/database/user.service';
import { User } from '../types/database.types';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
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
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};