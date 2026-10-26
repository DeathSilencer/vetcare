import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stethoscope, Lock, Mail, Eye, EyeOff, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';

const loginSchema = z.object({
  correo: z.string().email('Por favor ingrese un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: 'admin@vetcare.com',
      password: 'Admin123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data.correo, data.password);
      toast.success('¡Bienvenido al sistema VetCare!');
      navigate('/');
    } catch (error: any) {
      setServerError(error.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  const handleSelectDemoUser = (correo: string, pass: string) => {
    setValue('correo', correo, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logotipo Veterinario */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 items-center justify-center text-white shadow-xl shadow-brand-500/20 mb-4 transform hover:scale-105 transition-transform">
          <Stethoscope className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">VetCare</h2>
        <p className="mt-1 text-sm text-slate-400 font-medium">
          Sistema Integral de Gestión Veterinaria
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Iniciar Sesión</h3>
            <p className="text-xs text-slate-500">Ingrese sus credenciales para acceder al sistema</p>
          </div>

          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="ejemplo@vetcare.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.correo?.message}
                {...register('correo')}
              />
            </div>

            <div>
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
              icon={<KeyRound className="w-4 h-4" />}
            >
              Acceder al Sistema
            </Button>
          </form>

          {/* Accesos rápidos de Demostración para el Profesor */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Credenciales de Demostración Escolar:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemoUser('admin@vetcare.com', 'Admin123!')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group"
              >
                <span className="block text-xs font-bold text-slate-800 group-hover:text-brand-700">Admin</span>
                <span className="block text-[10px] text-slate-400">Acceso Total</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('recepcion@vetcare.com', 'Recepcion123!')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group"
              >
                <span className="block text-xs font-bold text-slate-800 group-hover:text-brand-700">Recepción</span>
                <span className="block text-[10px] text-slate-400">Citas y Pacientes</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('veterinario@vetcare.com', 'Vet123!')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group"
              >
                <span className="block text-xs font-bold text-slate-800 group-hover:text-brand-700">Veterinario</span>
                <span className="block text-[10px] text-slate-400">Dr. Roberto</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
