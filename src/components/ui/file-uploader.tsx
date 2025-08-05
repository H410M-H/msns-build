import { useCallback, type ChangeEvent } from 'react'
import { Input } from '~/components/ui/input'

interface FileUploaderProps {
  accept?: string
  onChange: (file: File) => void
  className?: string
}

export function FileUploader({ accept, onChange, className }: FileUploaderProps) {
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        onChange(file)
      }
    },
    [onChange]
  )

  return (
    <Input
      type="file"
      accept={accept}
      onChange={handleFileChange}
      className={className}
    />
  )
}

