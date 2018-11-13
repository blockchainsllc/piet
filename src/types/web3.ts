/**
 * 
 */

import * as t from './types.d'

export default class Web3 {

  static providers: t.Providers
  static givenProvider: t.Provider
  static modules: {
    Eth: new (provider: t.Provider) => t.Eth
    Net: new (provider: t.Provider) => t.Net
    Personal: new (provider: t.Provider) => t.Personal
    Shh: new (provider: t.Provider) => t.Shh
    Bzz: new (provider: t.Provider) => t.Bzz
  }

  version: string
  bzz: t.Bzz
  currentProvider: t.Provider
  eth: t.Eth
  ssh: t.Shh
  givenProvider: t.Provider
  providers: t.Providers
  utils: t.Utils
  BatchRequest: new () => t.BatchRequest

  // tslint:disable-next-line:no-empty
  constructor(provider: t.Provider) { }

  // tslint:disable-next-line:no-empty
  extend(methods: any): any { }

  // tslint:disable-next-line:no-empty
  setProvider(provider: t.Provider): void { }

}