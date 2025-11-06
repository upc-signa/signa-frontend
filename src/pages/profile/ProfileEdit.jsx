import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { profileService } from '../../services/api/profile.service';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    subtitle: 'SI',
    textSize: 'NORMAL',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Imagen
  const [preview, setPreview] = useState('');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await profileService.getMyProfile();
        setForm({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          birthDate: data.birthDate ?? '',
          subtitle: data.subtitle ?? 'SI',
          textSize: data.textSize ?? 'NORMAL',
        });
        setPreview(profileService.pictureUrl(data.profilePicturePath));
      } catch {
        toast.error('Error al cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickFile = () => fileRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await profileService.updateProfile(form);
      localStorage.setItem("textSize", form.textSize);
      window.dispatchEvent(new CustomEvent("textSize:changed", { detail: form.textSize }));

      if (file) {
        const r = await profileService.uploadPicture(file);
        const url = profileService.pictureUrl(r.profilePicturePath);
        localStorage.setItem('avatarUrl', url);
        window.dispatchEvent(new CustomEvent('avatar:changed', { detail: url }));
      }

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
                  <label className="uppercase text-xs tracking-widest text-orange-500 block mb-1">
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
                  <label className="uppercase text-xs tracking-widest text-orange-500 block mb-1">
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
                  <label className="uppercase text-xs tracking-widest text-orange-500 block mb-1">
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
                  <label className="uppercase text-xs tracking-widest text-orange-500 block mb-1">
                    Subtítulos
                  </label>
                  <select
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="select-underline"
                  >
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </div>

                <div>
                  <label className="uppercase text-xs tracking-widest text-orange-500 block mb-1">
                    Tamaño de texto
                  </label>
                  <select
                    value={form.textSize}
                    onChange={(e) => setForm({ ...form, textSize: e.target.value })}
                    className="select-underline"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="GRANDE">Grande</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="avatar-box text-sm overflow-hidden grid place-items-center">
                  {preview ? (
                    <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="muted">Sin imagen</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={pickFile}
                    className="px-3 py-1 rounded-md border hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    Cambiar imagen
                  </button>

                  {preview && (
                    <button
                      type="button"
                      className="px-3 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={async () => {
                        await profileService.deletePicture();
                        setFile(null);
                        setPreview('');

                        localStorage.removeItem('avatarUrl');
                        window.dispatchEvent(new CustomEvent('avatar:changed', { detail: '' }));

                        toast.success('Imagen eliminada');
                      }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
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