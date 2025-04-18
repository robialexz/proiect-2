import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, Mail, User, Building } from "lucide-react";
import { authService } from "@/services/auth/auth-service";

/**
 * Pagină de înregistrare
 * Permite utilizatorilor să își creeze un cont nou în aplicație
 */
const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("Trebuie să fiți de acord cu Termenii și Condițiile");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authService.signUp(email, password);

      if (error) {
        throw new Error(error.message || "Înregistrare eșuată");
      }

      // În aplicația reală, aici am salva datele profilului utilizatorului în baza de date
      // De exemplu: await supabase.from('profiles').insert({ user_id: data.user.id, first_name: firstName, last_name: lastName, company })

      // Redirecționăm către pagina de confirmare sau login
      navigate("/login", {
        state: {
          message:
            "Cont creat cu succes! Verificați email-ul pentru a confirma contul.",
        },
      });
    } catch (err: any) {
      console.error("Eroare la înregistrare:", err);
      setError(err.message || "A apărut o eroare la crearea contului");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">IM</span>
              </div>
              <span className="font-bold text-2xl text-white">
                InventoryMaster
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-4">
            Înregistrare
          </h1>
          <p className="text-slate-400 mt-2">
            Creați un cont nou pentru a accesa aplicația
          </p>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-900/50 border-red-800"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-300">
                Prenume
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Prenume"
                  className="bg-slate-800/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-300">
                Nume
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Nume"
                  className="bg-slate-800/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nume@exemplu.com"
                className="bg-slate-800/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-slate-300">
              Companie (opțional)
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Numele companiei"
                className="bg-slate-800/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Parolă
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-slate-800/50 border-slate-700 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer text-slate-300"
            >
              Sunt de acord cu{" "}
              <Link to="/terms" className="text-indigo-300 hover:underline">
                Termenii și Condițiile
              </Link>{" "}
              și{" "}
              <Link to="/privacy" className="text-indigo-300 hover:underline">
                Politica de Confidențialitate
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold mt-6"
            size="lg"
            disabled={loading}
          >
            {loading ? "Se creează contul..." : "Creează cont"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-300 mt-4">
              Aveți deja un cont?{" "}
              <Link
                to="/login"
                className="text-indigo-300 hover:underline font-medium"
              >
                Autentificare
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
