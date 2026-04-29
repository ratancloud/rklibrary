'use client';

import React, { useState } from 'react';
import { 
  useForm, 
  useFieldArray,  
  useWatch, 
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Clock } from 'lucide-react';
import { Shift, shiftWithIdSchema } from '@/lib/validations';
import SettingCard from './SettingCard';
import { ShiftCard } from './ShiftCard';


interface ShiftDetailsProps {
  shifts: Shift[];
  onSyncShifts: (shifts: Shift[]) => Promise<void>;
  isLoading?: boolean;
}

const shiftArraySchema = z.object({
  shifts: z.array(shiftWithIdSchema),
});

export type ShiftFormValues = z.input<typeof shiftArraySchema>;


export const ShiftDetails = ({ shifts, onSyncShifts, isLoading }: ShiftDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftArraySchema),
    values: { shifts: shifts.length > 0 ? shifts : [] },
    mode: 'onChange',
  });

  const { control, register, handleSubmit, reset, formState: { errors } } = form;

  const { fields } = useFieldArray({
    control,
    name: 'shifts',
  });

  const currentShifts = useWatch({ control, name: 'shifts' }) || [];

  const handleEditStart = () => {
    setIsEditing(true);
    reset({ shifts });
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({ shifts });
  };

  const onSubmit = async (data: ShiftFormValues) => {
    try {
      await onSyncShifts(data.shifts);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save shifts:', error);
    }
  };

  return (
    <SettingCard
      title="Shifts"
      icon={Clock}
      isEditing={isEditing}
      isLoading={isLoading}
      onEdit={handleEditStart}
      onCancel={handleCancel}
      onSave={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {fields.map((field, index) => (
          <ShiftCard
            key={field.id}
            index={index}
            field={field}
            currentShift={currentShifts[index]}
            isEditing={isEditing}
            isLoading={isLoading || false}
            control={control}
            register={register}
            errors={errors}
          />
        ))}
      </div>
    </SettingCard>
  );
};