type EndpointOptions = Partial<{ locale: string; currency: string }>

type AllowedClientBuilderOptions = {
  [K in keyof Required<EndpointOptions>]: boolean
}

type DefaultBuilderOptions = AllowedClientBuilderOptions & {
  [K in keyof AllowedClientBuilderOptions]: false
}

type WithBuilderOptions<
  T extends AllowedClientBuilderOptions,
  P extends EndpointOptions,
  UserPropsOnly extends Record<string, unknown> = Omit<P, keyof EndpointOptions>
> = UserPropsOnly & {
  [K in keyof Required<EndpointOptions>]: T[K] extends true ? Partial<P[K]> : P[K]
}

type AccountInfoProps<ClientOptions extends AllowedClientBuilderOptions> = WithBuilderOptions<
  ClientOptions,
  Omit<EndpointOptions, 'currency'> & Partial<Pick<EndpointOptions, 'currency'>>
>

class Account<ClientOptions extends AllowedClientBuilderOptions> {
  protected locale: string | undefined

  constructor(params: EndpointOptions = {}) {
    this.locale = params.locale
  }

  public accountInfo(props: AccountInfoProps<ClientOptions>) {
    const locale = props.hasOwnProperty('locale') ? props.locale : this.locale
    console.log('locale is...', locale)
  }
}

class Client<T extends AllowedClientBuilderOptions = DefaultBuilderOptions> {
  public account: Account<T>
  private options: EndpointOptions

  constructor(options: EndpointOptions = {}) {
    this.options = options
    this.account = new Account({ ...this.options })
  }

  public withLocale(locale: string) {
    return new Client<T & { locale: true }>({ ...this.options, locale })
  }

  public withCurrency(currency: string) {
    return new Client<T & { currency: true }>({ ...this.options, currency })
  }
}

// ---
// Example of how it works:
// ---
const c = new Client()

// locale is required here, you can't call this method otherwise
c.withLocale('en').account.accountInfo({ currency: 'test' })
c.withLocale('en').account.accountInfo({})

const d = c.withLocale('en')

// locale is optional - still taken into account if passed, but accountInfo(...) understands
// that client already received locale using `withLocale` method.
d.account.accountInfo({})

d.withLocale('fr').account.accountInfo({})

d.account.accountInfo({})
