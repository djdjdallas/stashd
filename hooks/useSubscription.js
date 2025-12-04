import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FREE_TIER_LIMIT } from '../lib/constants';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no subscription exists, create one
      if (!data) {
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setSubscription(newSub);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPro = subscription?.plan === 'pro';
  const savesThisMonth = subscription?.saves_this_month || 0;
  const limit = isPro ? Infinity : FREE_TIER_LIMIT;
  const remaining = Math.max(0, limit - savesThisMonth);
  const isAtLimit = !isPro && savesThisMonth >= FREE_TIER_LIMIT;
  const usagePercentage = isPro ? 0 : Math.min(100, (savesThisMonth / FREE_TIER_LIMIT) * 100);

  const checkCanSave = useCallback(async () => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('increment_save_count', {
        p_user_id: user.id
      });

      if (error) {
        throw error;
      }

      // Refresh subscription data after check
      await fetchSubscription();

      return {
        allowed: data.allowed,
        count: data.count,
        plan: data.plan,
        reason: data.allowed ? null : 'Monthly limit reached',
      };
    } catch (err) {
      console.error('Check save error:', err);
      return { allowed: false, reason: err.message };
    }
  }, [user, fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    isPro,
    savesThisMonth,
    limit,
    remaining,
    isAtLimit,
    usagePercentage,
    checkCanSave,
    refresh: fetchSubscription,
  };
}

export default useSubscription;
