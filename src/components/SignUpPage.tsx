import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SignUpHeader from "./SignUpHeader";
import SignUpBenefits from "./SignUpBenefits";
import SignUpForm from "./SignUpForm";
import SignUpTestimonialSection from "./SignUpTestimonialSection";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Header */}
      <SignUpHeader />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Teste Grátis por 7 Dias
            </h2>
            <p className="text-gray-600">
              Crie sua conta e comece a controlar suas finanças agora mesmo
            </p>
            <SignUpBenefits />
          </div>
          <SignUpForm />
          <SignUpTestimonialSection />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
