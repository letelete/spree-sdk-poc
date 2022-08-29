type EndpointOptions = Partial<{ locale: string; currency: string }>

type AllowedClientBuilderOptions = {
  [K in keyof Required<EndpointOptions>]: boolean
}

type DefaultBuilderOptions = AllowedClientBuilderOptions & {
  [K in keyof AllowedClientBuilderOptions]: false
}

type GetOptionalKeys<T> = {[K in keyof T as (undefined extends T[K] ? K : never)]: T[K]}

type GetRequiredKeys<T> = {[K in keyof T as (undefined extends T[K] ? never : K)]: T[K]}

type WithBuilderOptions<
  ClientOptions extends AllowedClientBuilderOptions,
  UserOptions extends EndpointOptions,
  UserCustomOptionsOnly extends Record<string, unknown> = Omit<UserOptions, keyof EndpointOptions>,
  UserEndpointOptionsOnly extends EndpointOptions = Omit<UserOptions, keyof UserCustomOptionsOnly>,
  OptionalEndpointOptionsOnly extends EndpointOptions = GetOptionalKeys<UserEndpointOptionsOnly>,
  RequiredEndpointOptionsOnly extends EndpointOptions = GetRequiredKeys<UserEndpointOptionsOnly>,
> = UserCustomOptionsOnly
    & OptionalEndpointOptionsOnly
    & Partial<RequiredEndpointOptionsOnly>
    & { [K in keyof Required<EndpointOptions> as RequiredEndpointOptionsOnly extends Pick<Required<EndpointOptions>, K> ? (ClientOptions[K] extends true ? never : K) : never]-?: UserOptions[K] };

type PickAsOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type AccountInfoProps<ClientOptions extends AllowedClientBuilderOptions> = WithBuilderOptions<
  ClientOptions,
  PickAsOptional<Required<EndpointOptions>, 'currency'> & { name?: string }
>

class Account<ClientOptions extends AllowedClientBuilderOptions> {
  protected locale: string | undefined

  constructor(params: EndpointOptions) {
    this.locale = params.locale
  }

  public accountInfo(props: AccountInfoProps<ClientOptions>) {
    const locale = props.hasOwnProperty('locale') ? props.locale : this.locale
    return locale;
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
    return new Client<Omit<T, 'locale'> & { locale: true }>({ ...this.options, locale })
  }

  public withCurrency(currency: string) {
    return new Client<Omit<T, 'currency'> & { currency: true }>({ ...this.options, currency })
  }
}

// --- examples
const c = new Client()
c.withCurrency('usd').account.accountInfo({ locale: 'en', currency: 'usd' })
c.withCurrency('usd').account.accountInfo({ locale: 'en' })
const d = new Client();
d.withLocale('en').account.accountInfo({});
d.withLocale('pl').withCurrency('usd').account.accountInfo({ locale:'en' })
d.account.accountInfo({ locale: 'en', name: 'johm' })
