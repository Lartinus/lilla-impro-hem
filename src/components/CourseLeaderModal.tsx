
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CourseLeader {
  id: number;
  name: string;
  image: string;
  bio: string;
}

interface CourseLeaderModalProps {
  leader: CourseLeader | null;
  isOpen: boolean;
  onClose: () => void;
}

const CourseLeaderModal = ({ leader, isOpen, onClose }: CourseLeaderModalProps) => {
  if (!leader) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-left">Kursledare</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img 
              src={leader.image} 
              alt={leader.name}
              className="w-32 h-32 rounded-full object-cover object-center mx-auto md:mx-0"
            />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-theatre-primary mb-4">
              {leader.name}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {leader.bio}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseLeaderModal;
