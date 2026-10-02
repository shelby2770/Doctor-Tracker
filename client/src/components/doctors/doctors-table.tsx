"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, getInitials } from "@/lib/utils";
import type { Doctor } from "@/lib/types";

interface DoctorsTableProps {
  doctors: Doctor[];
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

function RowActions({
  doctor,
  onEdit,
  onDelete,
}: {
  doctor: Doctor;
  onEdit: (d: Doctor) => void;
  onDelete: (d: Doctor) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/doctors/${doctor._id}`}
        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-600 focus-ring"
        title="View patients"
        aria-label="View patients"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <button
        onClick={() => onEdit(doctor)}
        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 focus-ring"
        title="Edit"
        aria-label="Edit doctor"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(doctor)}
        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-ring"
        title="Delete"
        aria-label="Delete doctor"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DoctorsTable({ doctors, onEdit, onDelete }: DoctorsTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 text-left text-xs font-semibold uppercase tracking-wide text-surface-400">
              <th className="px-5 py-3">Doctor</th>
              <th className="px-5 py-3">Specialization</th>
              <th className="px-5 py-3">Hospital</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Patients</th>
              <th className="px-5 py-3">Added</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {doctors.map((doctor) => (
              <tr key={doctor._id} className="transition-colors hover:bg-surface-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                      {getInitials(doctor.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-surface-900">
                        {doctor.name}
                      </p>
                      <p className="truncate text-xs text-surface-400">{doctor.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge tone="primary">{doctor.specialization}</Badge>
                </td>
                <td className="px-5 py-3 text-surface-600">{doctor.hospital}</td>
                <td className="px-5 py-3 text-surface-600">{doctor.phone}</td>
                <td className="px-5 py-3">
                  <span className="font-medium text-surface-900">
                    {doctor.patientCount ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3 text-surface-500">
                  {formatDate(doctor.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <RowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-surface-100 md:hidden">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {getInitials(doctor.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-surface-900">{doctor.name}</p>
              <p className="truncate text-xs text-surface-400">{doctor.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="primary">{doctor.specialization}</Badge>
                <Badge tone="neutral">{doctor.patientCount ?? 0} patients</Badge>
              </div>
              <p className="mt-2 text-xs text-surface-500">
                {doctor.hospital} · {doctor.phone}
              </p>
            </div>
            <RowActions doctor={doctor} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </>
  );
}
