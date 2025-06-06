
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface SignUpFormProps {
  onSuccess?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Lösenorden stämmer inte överens');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Registrering lyckades",
        description: "Kontrollera din e-post för att verifiera ditt konto.",
      });
      onSuccess?.();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-postadress
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="din@email.se"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Lösenord
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Minst 6 tecken"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Bekräfta lösenord
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Upprepa lösenordet"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Registrerar..." : "Registrera"}
      </Button>
    </form>
  );
};

export default SignUpForm;
