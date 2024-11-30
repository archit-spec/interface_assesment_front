"use client"

import { useState } from "react"
import { Upload, X, ArrowRight } from 'lucide-react'
import { Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>
  onProcess: (file: File) => Promise<void>
  accept?: string
  label: string
}

export function FileUpload({ onFileSelect, onProcess, accept = ".csv,.xlsx", label }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploading(true)
      setProgress(0)
      setError(null)
      
      try {
        // Simulate upload progress
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 95) {
              clearInterval(interval)
              return prev
            }
            return prev + 5
          })
        }, 100)

        await onFileSelect(selectedFile)
        setProgress(100)
        
        // Reset after successful upload
        setTimeout(() => {
          setUploading(false)
          setProgress(0)
        }, 500)
      } catch (error) {
        console.error('Upload failed:', error)
        setError('Upload failed. Please try again.')
        setUploading(false)
        setProgress(0)
        setFile(null)
      }
    }
  }

  const handleRemove = () => {
    setFile(null)
    setUploading(false)
    setProgress(0)
    setError(null)
  }

  const handleProcess = async () => {
    if (!file) return
    setProcessing(true)
    setError(null)
    try {
      await onProcess(file)
    } catch (error) {
      console.error('Processing failed:', error)
      setError('Processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
                {file && (
                  <div className="mt-4 text-sm font-medium text-foreground">
                    {file.name}
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileSelect}
              />
            </label>
          </div>
          {uploading && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          {file && !uploading && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
                Remove file
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleProcess}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Process File
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

