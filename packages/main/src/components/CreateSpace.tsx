import { useW3 } from '@w3ui/react'
import { ChangeEvent, useState } from 'react'
import * as Storacha from '@web3-storage/w3up-client/account'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import * as StorachaSpace from '@web3-storage/w3up-client/space'
import { shorten } from '@/lib/ui'
import Button from './Button'
import Input from './Input'

type SpaceCreationState = 'idle' | 'creating-space' | 'creating-delegation'

interface CreateSpaceProps {
  account: Storacha.Account
  onSuccess?: () => void
}

interface CreateSpaceModalProps extends Pick<CreateSpaceProps, 'account'> {
  isOpen: boolean
  onClose: () => void
}

export const CreateSpace = ({ account, onSuccess }: CreateSpaceProps) => {
  const [storacha] = useW3()
  const [spaceName, setSpaceName] = useState<string>('')
  const [state, setState] = useState<SpaceCreationState>('idle')
  const [recoveryKey, setRecoveryKey] = useState<string>('')
  const [hasCopiedKey, setHasCopiedKey] = useState(false)
  const [createdSpace, setCreatedSpace] =
    useState<StorachaSpace.OwnedSpace | null>(null)
  const [step, setStep] = useState<'name' | 'recovery'>('name')

  const onCreateSpace = async () => {
    try {
      setState('creating-space')
      const space = await storacha.client?.createSpace(spaceName, { account })
      if (!space) throw new Error('Space creation failed')

      const key = StorachaSpace.toMnemonic(space)
      setRecoveryKey(key)
      setCreatedSpace(space)
      setStep('recovery')
    } catch (error) {
      console.error('Creation failed:', error)
    } finally {
      setState('idle')
    }
  }

  const copyRecoveryKey = async () => {
    if (!recoveryKey) return

    try {
      await navigator.clipboard.writeText(recoveryKey)
      setHasCopiedKey(true)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const createDelegation = async () => {
    if (!createdSpace) return

    try {
      setState('creating-delegation')
      const recovery = await createdSpace.createRecovery(account.did())
      await storacha.client?.capability.access.delegate({
        space: createdSpace.did(),
        delegations: [recovery],
      })
      onSuccess?.()
    } catch (error) {
      console.error('Delegation failed:', error)
    } finally {
      setState('idle')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {step === 'name' ? (
        <>
          <div className="flex flex-col gap-2">
            <Input
              label="Space Name"
              value={spaceName}
              placeholder="e.g. Flying Geese"
              variant="default"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSpaceName(e.target.value)
              }
            />
          </div>
          <Button
            onClick={onCreateSpace}
            disabled={state === 'creating-space'}
            variant="primary"
            isLoading={state === 'creating-space'}
          >
            {state === 'creating-space' ? (
              <div className="flex items-center justify-center gap-2 w-full">
                <span className="truncate text-center text-sm transition-transform duration-300">
                  Creating {shorten(spaceName, 12)}.
                </span>
              </div>
            ) : (
              'Create Space'
            )}
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            You need to save the following secret recovery key somewhere safe!
            For example write it down on a piece of paper and put it inside your
            favorite book.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Recovery Key
            </label>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all">
              {recoveryKey}
            </div>
            <Button onClick={copyRecoveryKey} variant="secondary">
              {hasCopiedKey ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </div>
          <Button
            onClick={createDelegation}
            disabled={!hasCopiedKey || state === 'creating-delegation'}
            variant="primary"
            isLoading={state === 'creating-delegation'}
          >
            {state === 'creating-delegation' ? (
              <div className="flex items-center gap-2">
                Securing Recovery...
              </div>
            ) : (
              'Create delegation'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export function CreateSpaceModal({
  isOpen,
  onClose,
  account,
}: CreateSpaceModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl relative">
          <button
            onClick={onClose}
            className="absolute hover:cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Close modal</span>
          </button>
          <DialogTitle className="text-lg font-bold mb-4">
            Create New Space
          </DialogTitle>
          <CreateSpace account={account} onSuccess={onClose} />
        </DialogPanel>
      </div>
    </Dialog>
  )
}
