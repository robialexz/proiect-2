import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/services/auth/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

/**
 * Pagină de resetare a parolei
 * Permite utilizatorilor să solicite un link pentru resetarea parolei
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await authService.resetPassword(email);

      if (error) {
        throw new Error(error.message || "Resetare parolă eșuată");
      }

      setSuccess(
        "Am trimis un email cu instrucțiuni pentru resetarea parolei. Verificați-vă căsuța de email."
      );
      setEmail("");
    } catch (err: any) {
      // Removed console statement
      setError(err.message || "A apărut o eroare la trimiterea emailului de resetare");
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
            <CardTitle className="text-2xl font-bold text-white">Resetare parolă</CardTitle>
            <CardDescription className="text-slate-400">
              Introduceți adresa de email asociată contului dvs. și vă vom trimite un link pentru resetarea parolei.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-900/50 border-green-800">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
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
              
              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se procesează...
                  </>
                ) : (
                  "Trimite link de resetare"
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Link 
              to="/login" 
              className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la autentificare
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
