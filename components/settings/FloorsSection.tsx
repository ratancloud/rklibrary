'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, useWatch, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Layers, Plus, Trash2, Edit, Check } from 'lucide-react';
import { Floor } from '@/lib/validations';
import SettingCard from './SettingCard';

interface FloorsSectionProps {
  floors: Floor[];
  onSyncFloors: (floors: Floor[]) => Promise<void>;
  isLoading?: boolean;
}

const floorArraySchema = z.object({
  floors: z.array(
    z.object({
      id: z.string(), 
      name: z.string().min(1, 'Floor name is required'),
      totalSeats: z.number("Required").min(1, 'At least 1 seat required'),
    })
  ),
});

type FloorFormValues = z.infer<typeof floorArraySchema>;

export const FloorsSection = ({
  floors,
  onSyncFloors,
  isLoading,
}: FloorsSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [newFloor, setNewFloor] = useState({ name: '', totalSeats: '' });

  const form = useForm<FloorFormValues>({
    resolver: zodResolver(floorArraySchema),
    defaultValues: { floors: floors.length > 0 ? floors : [] }, 
    mode: 'onChange',
  });

  const { control, register, handleSubmit, reset, formState: { errors }, trigger } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'floors',
  });

  const currentFloors = useWatch({ control, name: 'floors' }) || [];

  const handleEditStart = () => {
    setIsEditing(false);
    reset({ floors: floors.length > 0 ? floors : [] });
  };

  const handleAddFloor = async () => {
    if (!newFloor.name.trim() || !newFloor.totalSeats) return;

    append({
      id: `temp-${Date.now()}`,
      name: newFloor.name,
      totalSeats: parseInt(newFloor.totalSeats) || 0,
    });

    setNewFloor({ name: '', totalSeats: '' });
    await trigger('floors');
  };

  const handleInlineSave = async (index: number) => {
    const isValid = await trigger([`floors.${index}.name` as Path<FloorFormValues>, `floors.${index}.totalSeats` as Path<FloorFormValues>]);
    if (isValid) {
      setEditingFloorId(null);
    }
  };

  const onSubmit = async (data: FloorFormValues) => {
    if (editingFloorId) setEditingFloorId(null);

    try {
      // await onSyncFloors(data.floors); 
      console.log("Syncing floors with data:", data.floors);
      setIsEditing(false);
      setEditingFloorId(null);
      setNewFloor({ name: '', totalSeats: '' });
    } catch (error) {
      console.error('Failed to sync floors:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingFloorId(null);
    setNewFloor({ name: '', totalSeats: '' });
    reset({ floors: floors.length > 0 ? floors : [] }); 
  };

  return (
    <SettingCard
      title="Floors"
      icon={Layers}
      isEditing={isEditing}
      isLoading={isLoading}
      onEdit={handleEditStart}
      onCancel={handleCancel}
      onSave={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {fields.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No floors added yet</p>
          ) : (
            fields.map((field, index) => {
              const isCurrentlyEditing = editingFloorId === field.id;
              
              return (
                <div key={field.id} className="group flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-all">
                  {isCurrentlyEditing ? (
                    <div className="flex flex-1 gap-2 items-center">
                      <div className="flex-1">
                        <input
                          {...register(`floors.${index}.name`)}
                          className="w-full px-2 py-1 border border-border rounded text-sm focus:ring-2 focus:ring-primary outline-none bg-background"
                          placeholder="Floor name"
                          disabled={isLoading}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleInlineSave(index)}
                        />
                        {errors.floors?.[index]?.name && (
                          <p className="text-destructive text-xs mt-1">{errors.floors[index]?.name?.message}</p>
                        )}
                      </div>
                      <div className="w-30">
                        <input
                          {...register(`floors.${index}.totalSeats`, { 
                            valueAsNumber: true
                          })}
                          type="number"
                          className="w-full px-2 py-1 border border-border rounded text-sm focus:ring-2 focus:ring-primary outline-none bg-background"
                          placeholder="0"
                          disabled={isLoading}
                          min={1}
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-", "."].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                        {errors.floors?.[index]?.totalSeats && (
                          <p className="text-destructive text-xs mt-1">{errors.floors[index]?.totalSeats?.message}</p>
                        )}
                      </div>
                      <button type="button" onClick={() => handleInlineSave(index)} disabled={isLoading} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30 disabled:opacity-50 transition-colors">
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">
                          {currentFloors[index]?.name || field.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentFloors[index]?.totalSeats || field.totalSeats} seats
                        </p>
                      </div>
                      
                      {isEditing && (
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setEditingFloorId(field.id)} disabled={isLoading} className="p-1.5 text-primary hover:text-primary hover:bg-primary/10 rounded disabled:opacity-50 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button type="button" onClick={() => remove(index)} disabled={isLoading} className="p-1.5 text-primary hover:text-destructive hover:bg-destructive/10 rounded disabled:opacity-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Floor Input */}
        {isEditing && (
          <div className="flex gap-2 items-start p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex-1">
              <input
                className="w-full px-2 py-1.5 bg-background border border-primary/20 rounded text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="New floor name"
                value={newFloor.name}
                onChange={(e) => setNewFloor((prev) => ({ ...prev, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFloor()}
                disabled={isLoading}
              />
            </div>
            <div className="w-24">
              <input
                className="w-full px-2 py-1.5 bg-background border border-primary/20 rounded text-sm focus:ring-2 focus:ring-primary outline-none"
                type="number"
                placeholder="Seats"
                value={newFloor.totalSeats}
                onChange={(e) => setNewFloor((prev) => ({ ...prev, totalSeats: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFloor()}
                disabled={isLoading}
              />
            </div>
            <button type="button" onClick={handleAddFloor} disabled={isLoading || !newFloor.name.trim() || !newFloor.totalSeats} className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </SettingCard>
  );
};