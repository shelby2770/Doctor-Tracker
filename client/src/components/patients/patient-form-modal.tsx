"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import {
  patientBaseSchema,
  patientSchema,
  type PatientValues,
} from "@/lib/schemas";
import { PATIENT_GENDERS, PATIENT_STATUSES, type Patient } from "@/lib/types";

export interface DoctorOption {
  id: string;
  name: string;
}

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  /** When true, a doctor <select> is shown and required. */
  requireDoctor?: boolean;
  doctorOptions?: DoctorOption[];
  isSubmitting?: boolean;
  /** Receives all patient fields; `doctor` is present only when `requireDoctor`. */
  onSubmit: (values: PatientValues) => Promise<void>;
}

function emptyValues(requireDoctor: boolean): PatientValues {
  return {
    name: "",
    age: 0,
    gender: "Male",
    condition: "",
    status: "Active",
    phone: "",
    email: "",
    ...(requireDoctor ? { doctor: "" } : {}),
  } as PatientValues;
}

export function PatientFormModal({
  open,
  onClose,
  patient,
  requireDoctor = false,
  doctorOptions = [],
  isSubmitting,
  onSubmit,
}: PatientFormModalProps) {
  const isEdit = !!patient;
  const schema = requireDoctor ? patientSchema : patientBaseSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientValues>({
    // `schema` is the base (no doctor) or full schema; cast keeps one form type.
    resolver: zodResolver(schema) as unknown as Resolver<PatientValues>,
    defaultValues: emptyValues(requireDoctor),
  });

  const err = errors as Record<string, { message?: string } | undefined>;

  useEffect(() => {
    if (!open) return;
    if (patient) {
      const doctorId =
        typeof patient.doctor === "string" ? patient.doctor : patient.doctor?._id;
      reset({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        condition: patient.condition,
        status: patient.status,
        phone: patient.phone,
        email: patient.email,
        ...(requireDoctor ? { doctor: doctorId ?? "" } : {}),
      } as PatientValues);
    } else {
      reset(emptyValues(requireDoctor));
    }
  }, [open, patient, requireDoctor, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit patient" : "Add patient"}
      description={
        isEdit ? "Update this patient's details." : "Create a new patient record."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isSubmitting}>
            {isEdit ? "Save changes" : "Create patient"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required error={err.name?.message}>
            <Input placeholder="John Smith" invalid={!!err.name} {...register("name")} />
          </Field>
          <Field label="Age" required error={err.age?.message}>
            <Input
              type="number"
              min={0}
              max={130}
              placeholder="42"
              invalid={!!err.age}
              {...register("age")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Gender" required error={err.gender?.message}>
            <Select invalid={!!err.gender} {...register("gender")}>
              {PATIENT_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" required error={err.status?.message}>
            <Select invalid={!!err.status} {...register("status")}>
              {PATIENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Condition" required error={err.condition?.message}>
          <Input
            placeholder="Hypertension"
            invalid={!!err.condition}
            {...register("condition")}
          />
        </Field>

        {requireDoctor ? (
          <Field label="Assigned doctor" required error={err.doctor?.message}>
            <Select invalid={!!err.doctor} {...register("doctor")} defaultValue="">
              <option value="" disabled>
                Select a doctor…
              </option>
              {doctorOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" required error={err.phone?.message}>
            <Input placeholder="+1-555-123-4567" invalid={!!err.phone} {...register("phone")} />
          </Field>
          <Field label="Email" required error={err.email?.message}>
            <Input
              type="email"
              placeholder="john.smith@example.com"
              invalid={!!err.email}
              {...register("email")}
            />
          </Field>
        </div>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
