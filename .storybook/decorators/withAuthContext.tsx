import { Decorator } from '@storybook/react'
import { fn } from '@storybook/test'
import {
  AuthenticatorContext,
  AuthenticatorContextActions,
  AuthenticatorContextState,
} from '@storacha/ui-react'

export function withAuthContext(
  state: Partial<AuthenticatorContextState>,
  actions: Partial<AuthenticatorContextActions> = {}
): Decorator {
  return function WithAuthContext(Story) {
    return (
      <AuthenticatorContext.Provider
        value={[
          {
            accounts: [],
            spaces: [],
            email: '',
            submitted: false,
            ...state,
          },
          {
            setEmail: fn(),
            cancelLogin: fn(),
            logout: fn(),
            ...actions,
          },
        ]}
      >
        <Story />
      </AuthenticatorContext.Provider>
    )
  }
}
