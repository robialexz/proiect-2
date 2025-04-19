import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Pagină de înregistrare
 * Permite utilizatorilor să își creeze un cont nou
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
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("Trebuie să fii de acord cu Termenii și Condițiile");
      return;
    }

    setLoading(true);

    try {
      console.log("Trimit cerere de înregistrare pentru:", {
        email,
        firstName,
        lastName,
        company,
      });

      const { data, error } = await signUp(email, password);

      if (error) {
        console.error("Eroare returnată de signUp:", error);
        throw new Error(error.message || "Înregistrare eșuată");
      }

      console.log("Răspuns înregistrare:", data);

      // Verificăm dacă utilizatorul a fost creat cu succes
      if (data?.user) {
        console.log("Utilizator creat cu ID:", data.user.id);
        console.log(
          "Email confirmat:",
          data.user.email_confirmed_at ? "Da" : "Nu"
        );

        // În aplicația reală, aici am salva datele profilului utilizatorului în baza de date
        // De exemplu: await supabase.from('profiles').insert({ user_id: data.user.id, first_name: firstName, last_name: lastName, company })

        // Verificăm dacă emailul trebuie confirmat
        if (!data.user.email_confirmed_at) {
          // Redirecționăm către pagina de confirmare sau login
          navigate("/login", {
            state: {
              message:
                "Cont creat cu succes! Verificați email-ul pentru a confirma contul.",
            },
          });
        } else {
          // Dacă emailul este deja confirmat, redirecționăm direct către dashboard
          navigate("/dashboard");
        }
      } else {
        // Dacă nu avem date despre utilizator, afișăm un mesaj generic
        navigate("/login", {
          state: {
            message:
              "Cont creat cu succes! Verificați email-ul pentru a confirma contul.",
          },
        });
      }
    } catch (err: any) {
      console.error("Excepție la înregistrare:", err);
      setError(err.message || "A apărut o eroare la crearea contului");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">IM</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Înregistrare
            </CardTitle>
            <CardDescription className="text-slate-400">
              Creați un cont nou pentru a accesa aplicația
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-900/50 border-red-800"
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
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prenume"
                    required
                    autoComplete="given-name"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-300">
                    Nume
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nume"
                    required
                    autoComplete="family-name"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nume@exemplu.com"
                  required
                  autoComplete="email"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-300">
                  Companie (opțional)
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Numele companiei"
                  autoComplete="organization"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Parolă
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                  className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sunt de acord cu{" "}
                  <Link
                    to="/terms"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Termenii și Condițiile
                  </Link>{" "}
                  și{" "}
                  <Link
                    to="/privacy"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Politica de Confidențialitate
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se creează contul...
                  </>
                ) : (
                  "Creează cont"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-slate-400">
              Ai deja un cont?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Autentifică-te
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
