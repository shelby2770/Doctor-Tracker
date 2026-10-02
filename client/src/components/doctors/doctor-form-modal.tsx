"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { doctorSchema, type DoctorValues } from "@/lib/schemas";
import type { Doctor } from "@/lib/types";

const EMPTY: DoctorValues = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  isSubmitting?: boolean;
  onSubmit: (values: DoctorValues) => Promise<void>;
}

export function DoctorFormModal({
  open,
  onClose,
  doctor,
  isSubmitting,
  onSubmit,
}: DoctorFormModalProps) {
  const isEdit = !!doctor;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: EMPTY,
  });

  // Populate with the doctor being edited whenever the modal opens.
  useEffect(() => {
    if (open) {
      reset(
        doctor
          ? {
              name: doctor.name,
              specialization: doctor.specialization,
              hospital: doctor.hospital,
              phone: doctor.phone,
              email: doctor.email,
            }
          : EMPTY,
      );
    }
  }, [open, doctor, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit doctor" : "Add doctor"}
      description={
        isEdit
          ? "Update this doctor's details."
          : "Create a new doctor record."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isSubmitting}>
            {isEdit ? "Save changes" : "Create doctor"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" required error={errors.name?.message}>
          <Input placeholder="Dr. Jane Doe" invalid={!!errors.name} {...register("name")} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Specialization" required error={errors.specialization?.message}>
            <Input
              placeholder="Cardiology"
              invalid={!!errors.specialization}
              {...register("specialization")}
            />
          </Field>
          <Field label="Hospital" required error={errors.hospital?.message}>
            <Input
              placeholder="City General Hospital"
              invalid={!!errors.hospital}
              {...register("hospital")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" required error={errors.phone?.message}>
            <Input placeholder="+1-555-123-4567" invalid={!!errors.phone} {...register("phone")} />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <Input
              type="email"
              placeholder="jane.doe@hospital.com"
              invalid={!!errors.email}
              {...register("email")}
            />
          </Field>
        </div>
        {/* Allow Enter-to-submit */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
