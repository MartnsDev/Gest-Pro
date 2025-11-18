"use client"

/**
 * COMPONENTE: FormInput
 * Campo de input reutilizável para formulários de autenticação
 */

import type React from "react"
import type { LucideIcon } from "lucide-react"
import styles from "@/app/styles/auth.module.css"

interface FormInputProps {
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: LucideIcon
  required?: boolean
  disabled?: boolean
}

export function FormInput({ type, placeholder, value, onChange, icon: Icon, required, disabled }: FormInputProps) {
  return (
    <div className={styles.inputGroup}>
      <Icon className={styles.inputIcon} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.inputField}
        required={required}
        disabled={disabled}
      />
    </div>
  )
}
