import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { profileService } from '../../services/api/profile.service';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', birthDate: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mockSubs, setMockSubs] = useState('Sí');
  const [mockTextSize, setMockTextSize] = useState('Normal');

  useEffect(() => {
    (async () => {
      try {
        const data = await profileService.getMyProfile();
        setForm({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          birthDate: data.birthDate ?? '',
        });
      } catch {
        toast.error('Error al cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await profileService.updateProfile(form);
      toast.success('Perfil actualizado correctamente');
      navigate('/profile', { replace: true });
    } catch {
      toast.error('No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-500">Cargando…</div>;

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-orange-500 mb-6">Editar Perfil</h1>

        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-black/10 pointer-events-none" />
          <section className="relative card">
            <div className="grid md:grid-cols-[1fr_260px] gap-8">
              <div className="space-y-6">
                <div>
                  <label className="uppercase text-[11px] tracking-widest text-orange-500 block mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input-underline"
                    placeholder="Nombre"
                  />
                </div>

                <div>
                  <label className="uppercase text-[11px] tracking-widest text-orange-500 block mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input-underline"
                    placeholder="Apellido"
                  />
                </div>

                <div>
                  <label className="uppercase text-[11px] tracking-widest text-orange-500 block mb-1">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                    className="input-underline"
                  />
                </div>

                <div>
                  <label className="uppercase text-[11px] tracking-widest text-orange-500 block mb-1">
                    Subtítulos
                  </label>
                  <select
                    value={mockSubs}
                    onChange={(e) => setMockSubs(e.target.value)}
                    className="select-underline"
                  >
                    <option>Sí</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="uppercase text-[11px] tracking-widest text-orange-500 block mb-1">
                    Tamaño de texto
                  </label>
                  <select
                    value={mockTextSize}
                    onChange={(e) => setMockTextSize(e.target.value)}
                    className="select-underline"
                  >
                    <option>Normal</option>
                    <option>Grande</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start justify-center">
                <div className="avatar-box text-sm">
                  Cambiar imagen
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-10 rounded-full shadow transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
