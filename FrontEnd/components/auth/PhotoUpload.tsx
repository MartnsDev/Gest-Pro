"use client"

/**
 * COMPONENTE: PhotoUpload
 * Upload de foto de perfil com preview
 */

import type React from "react"
import { User, Upload } from "lucide-react"
import styles from "@/app/styles/auth.module.css"

interface PhotoUploadProps {
  preview: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export function PhotoUpload({ preview, onChange, disabled }: PhotoUploadProps) {
  return (
    <div className={styles.photoUpload}>
      <div>
        {preview ? (
          <img src={preview || "/placeholder.svg"} alt="Preview" className={styles.photoPreview} />
        ) : (
          <div className={styles.photoPlaceholder}>
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <label className={styles.photoUploadBtn}>
        <Upload className="w-4 h-4" />
        Escolher Foto
        <input type="file" accept="image/*" onChange={onChange} className="hidden" disabled={disabled} />
      </label>
    </div>
  )
}
