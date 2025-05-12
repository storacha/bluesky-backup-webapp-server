import { useCallback, useEffect, useState } from 'react'

import { cidUrl } from '@/lib/storacha'
import { ATBlob, State } from '@/types'

interface BlobItem extends ATBlob {
  imageUrl: string
}

export const useBlobs = (atBlobs: ATBlob[]) => {
  const [state, setState] = useState<State>('idle')
  const [blobs, setBlobs] = useState<BlobItem[]>()

  const getBlobs = useCallback(async () => {
    if (!atBlobs) {
      console.log('No blobs provided. Skipping!')
      return
    }

    try {
      setState('loading')
      const blobItems = await Promise.all(
        atBlobs?.map(async (blob) => {
          const data = await fetch(cidUrl(blob.cid))
          if (!data.ok) throw new Error(`Failed to fetch ${blob.cid}`)
          const buffer = await data.arrayBuffer()
          return new Blob([buffer], {
            type: data.headers.get('Content-Type') || 'image/jpeg',
          })
        })
      )

      const blobData = atBlobs.map((blob, index) => ({
        ...blob,
        imageUrl: URL.createObjectURL(blobItems[index] as Blob),
      }))
      setBlobs(blobData)
    } catch (error) {
      console.error(error)
    } finally {
      setState('idle')
    }
  }, [atBlobs])

  useEffect(() => {
    if (atBlobs) getBlobs()
  }, [atBlobs, getBlobs])

  // free dem memories!!
  useEffect(() => {
    return () => {
      blobs?.forEach((blob) => {
        URL.revokeObjectURL(blob.imageUrl)
      })
    }
  }, [blobs])

  return {
    blobs,
    getBlobs,
    loading: state === 'loading',
  }
}
