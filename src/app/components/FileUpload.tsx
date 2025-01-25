'use client'
import { IKUpload } from "imagekitio-next"
import { IKUploadResponse } from 'imagekitio-next/dist/types/components/IKUpload/props'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'


const FileUpload = ({onSuccess}: {onSuccess: (response: IKUploadResponse) => void}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onError = (err: { message: string }) => {
    setError(err.message)
    setUploading(false)
  }

  const handleSuccess = (response: IKUploadResponse) => {
    setUploading(false)
    setError(null)
    onSuccess(response)
  }

  const handleStartUpload = () => {
    setUploading(true)
    setError(null)
  }


  return (
    <div className='space-y-4'>
      <IKUpload
        fileName='product-image.png'
        onError={onError}
        onSuccess={handleSuccess}
        onUploadStart={handleStartUpload}
        validateFile={(file: File) => {
          const validTypes = ['image/jpeg', 'image/png', 'image/wepb']
          if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, PNG, or WebP)')
            return false
          }
          if (file.size > 1024 * 1024 * 5) {
            // 5MB limit
            setError('File size must be less than 5MB')
            return false
          }
          return true
        }}
      />

      {uploading && (
        <div className='flex items-center gap-2 text-sm text-primary'>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span>Uploading...</span>
        </div>
      )}

      {error && <div className='text-error text-sm'>{error}</div>}
    </div>
  )
}

export default FileUpload