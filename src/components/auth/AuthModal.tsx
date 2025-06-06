
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ children, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Logga in</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mitt konto</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Logga in</TabsTrigger>
            <TabsTrigger value="signup">Registrera</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <LoginForm onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="signup" className="space-y-4">
            <SignUpForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
