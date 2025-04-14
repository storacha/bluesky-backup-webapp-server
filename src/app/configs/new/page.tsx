'use client'

import { Sidebar } from '@/app/Sidebar'
import { Form } from '../Form'

export default function NewConfig() {
  return (
    <>
      <Sidebar selectedConfigId={null} />
      <Form />
    </>
  )
}
