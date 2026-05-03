import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

/**
 * usePlan — central hook for subscription plan gating.
 * Reads business.plan from Redux and returns helpers.
 */
export default function usePlan() {
  const { business } = useSelector((state) => state.business);
  const navigate = useNavigate();

  const plan = business?.plan || 'free';
  const isPro = plan === 'pro';
  const isFree = !isPro;

  const goUpgrade = () => navigate('/dashboard/upgrade');

  return { plan, isPro, isFree, goUpgrade };
}
