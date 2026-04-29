import React from 'react';
import { LucideIcon, Check, Edit, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

interface SettingCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isEditing: boolean;
  isLoading?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => Promise<void> | void;
}

const SettingCard = ({
  title,
  icon,
  children,
  isEditing,
  isLoading = false,
  onEdit,
  onCancel,
  onSave,
}: SettingCardProps) => {
  const Icon = icon;
  return (
    <Card className="mt-8">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
        <div className="flex items-center gap-2">
          <Icon size={20} className="text-primary" />
          <h2 className="font-bold text-lg text-foreground">{title}</h2>
        </div>

        <button
          onClick={isEditing ? onCancel : onEdit}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            isEditing
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          {isEditing ? (
            <>
              <X size={16} /> Cancel
            </>
          ) : (
            <>
              <Edit size={16} /> Edit Details
            </>
          )}
        </button>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-6">
        {children}
      </CardContent>

      {/* Footer - Only shows when editing */}
      {isEditing && (
        <CardFooter className="flex justify-end border-t pt-4">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Changes
              </>
            )}
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SettingCard;