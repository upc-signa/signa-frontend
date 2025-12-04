import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { profileService } from '../../services/api/profile.service';
import { planService } from '../../services/api/plan.service';
import { daysUntil, formatDateLocal } from '../../utils/planExpiry';

const formatPlan = (type) =>
  (type || '').toLowerCase() === 'premium' ? 'Premium' : 'Free';

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await profileService.getMyProfile();
        setProfile(user);
        const currentPlan = await planService.getCurrentPlan().catch(() => null);
        console.log('PLAN DESDE BACK:', currentPlan); // 👈 debug
        setPlan(currentPlan);
      } catch {
        toast.error('Error al cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function subtractOneDay(dateString) {
    const d = new Date(dateString);
    d.setDate(d.getDate() - 1);
    return d;
  }

  // handler para cancelar la renovación automática
  const handleCancelRenewal = async () => {
    try {
      setCancelling(true);
      const updatedProfile = await planService.cancelAutoRenewal();

      setProfile(updatedProfile);
      if (updatedProfile.plan) {
        setPlan(updatedProfile.plan);
      }

      toast.success(
        'La renovación automática ha sido cancelada. Tu plan seguirá activo hasta la fecha de vencimiento.'
      );
    } catch (err) {
      toast.error(
        'No se pudo cancelar la renovación automática. Inténtalo de nuevo más tarde.'
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-500">Cargando…</div>;
  if (!profile) return <div className="p-10 text-red-500">No se encontró el perfil.</div>;

  const isPremium = plan?.planType === 'PREMIUM' && plan?.active;

  const daysLeft =
    plan && typeof plan?.endDate === 'string' ? daysUntil(plan.endDate) : null;
  const showDaysLeft =
    plan && plan.planType === 'PREMIUM' && !plan.expired && typeof daysLeft === 'number';

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-10" data-tour-id="profile-page">
        <h1 className="text-3xl font-black text-orange-500 mb-6">Perfil</h1>

        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-black/10 pointer-events-none" />
          <section className="card relative rounded-2xl shadow-md p-6 sm:p-8">
            <div className="grid md:grid-cols-[1fr_260px] gap-8">
              <div>
                <div className="mb-4">
                  <div className="uppercase text-xs tracking-widest text-orange-500">Usuario</div>
                  <div className="text-sm border-b border-soft pb-1">
                    {profile.firstName} {profile.lastName}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="uppercase text-xs tracking-widest text-orange-500">Contraseña</div>
                  <div className="text-sm border-b border-soft pb-1">************</div>
                </div>

                <div className="mb-4">
                  <div className="uppercase text-xs tracking-widest text-orange-500">
                    Fecha de nacimiento
                  </div>
                  <div className="text-sm border-b border-soft pb-1">{profile.birthDate}</div>
                </div>

                <div className="mb-4">
                  <div className="uppercase text-xs tracking-widest text-orange-500">Subtítulos</div>
                  <div className="text-sm border-b border-soft pb-1">
                    {profile.subtitle === 'SI' ? 'Sí' : 'No'}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="uppercase text-xs tracking-widest text-orange-500">
                    Tamaño de texto
                  </div>
                  <div className="text-sm border-b border-soft pb-1">
                    {profile.textSize === 'GRANDE' ? 'Grande' : 'Normal'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <Link
                  to="/profile/edit"
                  className="self-end bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition-colors"
                >
                  Editar perfil
                </Link>

                <div className="avatar-box text-sm overflow-hidden grid place-items-center">
                  {profile.profilePicturePath ? (
                    <img
                      src={profileService.pictureUrl(profile.profilePicturePath)}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="muted">Sin imagen</span>
                  )}
                </div>
              </div>
            </div>

            <hr className="divider border-soft" />

            <div>
              <h2 className="text-xl font-semibold text-orange-500 mb-4">Plan actual</h2>

              {plan ? (
                <div className="grid sm:grid-cols-2 gap-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Tipo:</span> {formatPlan(plan.planType)}
                  </p>
                  <p>
                    <span className="font-semibold">Estado:</span>{' '}
                    {plan.active ? 'Activo' : plan.expired ? 'Expirado' : 'Inactivo'}
                  </p>
                  <p>
                    <span className="font-semibold">Inicio:</span>{' '}
                    {formatDateLocal(subtractOneDay(plan.startDate))}
                  </p>
                  <p>
                    <span className="font-semibold">Fin:</span>{' '}
                    {plan.planType === 'FREE' ||
                    new Date(plan.endDate).getFullYear() -
                      new Date(plan.startDate).getFullYear() >
                      100
                      ? 'Sin vencimiento'
                      : formatDateLocal(plan.endDate) || '—'}
                  </p>
                  {plan.planType === 'FREE' && (
                    <p className="sm:col-span-2 text-gray-600 text-xs italic">
                      El plan gratuito no tiene fecha de vencimiento.
                    </p>
                  )}

                  {showDaysLeft && (
                    <p className="sm:col-span-2">
                      <span className="font-semibold">Días restantes:</span>{' '}
                      {daysLeft === 0 ? 'Vence hoy' : `${daysLeft} día${daysLeft === 1 ? '' : 's'}`}
                    </p>
                  )}
                  {plan.expired && (
                    <p className="sm:col-span-2 text-red-600 font-medium">
                      Tu plan ha vencido. Renueva para mantener el acceso.
                    </p>
                  )}

                  {/* Bloque de renovación automática */}
                  {isPremium && !plan.expired && (
                    <div className="sm:col-span-2 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-sm text-orange-800">
                        {plan.autoRenew
                          ? <>La renovación automática está <strong>activada</strong>. Tu plan se renovará al finalizar el periodo actual.</>
                          : <>La renovación automática está <strong>desactivada</strong>. Tu plan se mantendrá activo hasta la fecha de fin.</>
                        }
                      </p>

                      {plan.autoRenew && (
                        <button
                          type="button"
                          onClick={handleCancelRenewal}
                          disabled={cancelling}
                          className="bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
                        >
                          {cancelling ? 'Cancelando…' : 'Cancelar renovación'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Aún no hay información de plan.</div>
              )}
            </div>

            {!isPremium && (
              <div className="mt-8">
                <Link
                  to="/plans"
                  className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg shadow"
                >
                  SUSCRÍBETE
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}