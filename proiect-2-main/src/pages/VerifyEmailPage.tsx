import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Pagină de verificare a emailului placeholder
 * Această pagină va fi implementată complet în viitor cu noua logică de autentificare Supabase
 */
const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-slate-100 text-center mb-6">
          Verificare email
        </h1>

        <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg mb-6">
          <p className="text-blue-200 text-center">
            Pagină în construcție. Sistemul de verificare a emailului este în
            curs de implementare.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            disabled
            className="w-full bg-indigo-500/80 hover:bg-indigo-400/90 text-white font-semibold"
            size="lg"
          >
            Retrimite email de verificare
          </Button>

          <div className="text-center">
            <p className="text-sm text-slate-300 mt-4">
              <Link
                to="/login"
                className="text-indigo-300 hover:underline font-medium"
              >
                Înapoi la autentificare
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
